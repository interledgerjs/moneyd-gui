;(async function () {
  console.log('fetching graph data')
  const req = await fetch('/actions/graph')

  if (req.status !== 200) {
    throw new Error('failed to load network graph')
  }

  const json = await req.json()
  console.log('creating graph. json=', JSON.stringify(json, null, 2))

  function findLongestLabel (json) {
    return Math.max(json.name.length, ...json.contents.map(findLongestLabel))
  }

  const div = document.getElementById('svg')
  console.log(div.offsetWidth, div.offsetHeight)
  const width = div.offsetWidth
  const height = div.offsetHeight
  const maxLabelLength = Math.min(30, findLongestLabel(json))
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

  const radius = 5
  const diameter = radius * 2

  nodeGroup.append('svg:circle')
    .attr('class', 'node-dot')
    .attr('r', radius)

  nodeGroup.append('svg:text')
    .attr('text-anchor', d => d.children ? 'end' : 'start')
    .attr('dx', d => d.children ? -diameter : diameter)
    .attr('dy', 3)
    .text(d => {
      return (d.name.length > maxLabelLength)
        ? d.name.substring(0, 27) + '...'
        : d.name
    })

  d3.selectAll('.node-dot')
    .style('fill', document.defaultView
      .getComputedStyle(document.querySelector('#network span'))
      .backgroundColor)
})()
