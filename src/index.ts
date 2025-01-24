import { Elysia } from 'elysia'
import { node } from '@elysiajs/node'
// services.others
import { ILocals } from './entities/app';
// controllers
import rootController from './adapters/client.in/root.ctrl'

(async () => {

    /**
     * Services
     */
    const allServices: ILocals = {
    }
    const app = new Elysia({ adapter: node() })

    /**
    * controllers
    */
    app.use(rootController)

    app.listen(8080, ({ hostname, port }) => {
        console.log(
            `🦊 Elysia is running at ${hostname}:${port}`
        )
    })

})()