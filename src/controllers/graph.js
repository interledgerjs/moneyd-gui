const fs = require('fs-extra')
const path = require('path')
const Admin = require('../lib/admin')

class GraphController {
  constructor (deps) {
    this.admin = deps(Admin)
  }

  async init (router) {
    router.get('/actions/graph', async ctx => {
      const table = await this.admin.query('routing')
      const { address } = await this.admin.query('accounts')
      const graph = {
        nodes: [ { name: address, group: 1 } ],
        links: []
      }

      let groupIndex = 1
      const groups = {
        [address]: 0
      }

      for (const dest of Object.keys(table.localRoutingTable)) {
        if (dest !== address) {
          groups[dest] = groupIndex
          graph.nodes.push({ name: dest, group: groupIndex }) 
          groupIndex++

          const pathString = table.localRoutingTable[dest].path
          const path = pathString ? pathString.split(' ') : []

          if (path.length) {
            let last = address
            for (const hop of path) {
              graph.links.push({
                source: groups[last],
                target: groups[hop],
                weight: 1
              })
              last = hop
            }
          } else {
            graph.links.push({
              source: groups[address],
              target: groups[dest],
              weight: 1
            })
          }
        }
      }

      ctx.body = graph
    })

    router.get('/graph.js', async ctx => {
      ctx.set('Content-Type', 'text/javascript')
      ctx.body = await fs.readFile(path.resolve(__dirname, '../../static/graph.js'))
    })
  }
}

module.exports = GraphController
