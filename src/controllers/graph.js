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

      const mapTree = {
        name: address,
        contents: {}
      }

      for (const dest of Object.keys(table.localRoutingTable)) {
        if (dest === address) continue
        const pathStr = table.localRoutingTable[dest].path
        const path = pathStr ? pathStr.split(' ') : [ dest ]

        let root = mapTree
        for (const hop of path) {
          if (!root.contents[hop]) {
            root.contents[hop] = { name: hop, contents: [] }
          }

          root = root.contents[hop]
        }
      }

      function mapTreeToListTree (root) {
        return {
          name: root.name,
          contents: Object.values(root.contents).map(mapTreeToListTree)
        }
      }

      ctx.body = mapTreeToListTree(mapTree)
    })

    router.get('/graph.js', async ctx => {
      ctx.set('Content-Type', 'text/javascript')
      ctx.body = await fs.readFile(path.resolve(__dirname, '../../static/graph.js'))
    })
  }
}

module.exports = GraphController
