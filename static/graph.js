;(async function () {
  console.log('fetching graph data')
  const req = await fetch('/actions/graph')

  if (req.status !== 200) {
    throw new Error('failed to load network graph')
  }

  const json = await req.json()
  console.log('creating graph. json=', JSON.stringify(json, null, 2))

  const width = 960
  const height = 500
  const maxLabelLength = 30
  const fontSize = 12

  const tree = d3.layout.tree()
    .sort(null)
    .size([ height, width - 2 * maxLabelLength * fontSize ])
    .children(d => {
      return (!d.contents || d.contents.length === 0) ? null : d.contents
    })

  const nodes = tree.nodes(json)
  const links = tree.links(nodes)

  const layout = d3.select('#svg')
    .append('svg:svg')
      .attr('width', width)
      .attr('height', height)
    .append('svg:g')
      .attr('class', 'container')
      .attr('transform', `translate(${maxLabelLength * fontSize},0)`)

  const link = d3.svg.diagonal()
    .projection(d => {
      return [d.y, d.x]
    })

  layout.selectAll('path.link')
    .data(links)
    .enter()
    .append('svg:path')
      .attr('class', 'link')
      .attr('d', link)

  const nodeGroup = layout.selectAll('g.node')
    .data(nodes)
    .enter()
    .append('svg:g')
      .attr('class', 'node')
      .attr('transform', d => {
        return `translate(${d.y},${d.x})`
      })

  nodeGroup.append('svg:text')
    .attr('text-anchor', d => d.children ? 'end' : 'start')
    .attr('dx', d => d.children ? -20 : 20)
    .attr('dy', 3)
    .text(d => {
      return (d.name.length > maxLabelLength)
        ? d.name.substring(0, 27) + '...'
        : d.name
    })
})()
