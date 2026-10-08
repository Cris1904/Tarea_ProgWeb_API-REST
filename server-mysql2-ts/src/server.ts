import express, {Application} from 'express';
import routes from './routes';

export class Server{
    //atributos
    public app:Application;
    private port:string|number;

    //constructor
    constructor(){
        this.app = express();
        this.port = process.env.PORT || 3000;
        this.middlewares();
        this.routes();
    }
    //metodos
    private middlewares(): void{
        this.app.use(express.json());
    }

    private routes(): void{
        this.app.use('/api/v1', routes);
    }

    public listen(): void{
        this.app.listen(this.port, ()=> {
            console.log(`Servidor corriendo en el puerto ${this.port}`);
        })
    }
}