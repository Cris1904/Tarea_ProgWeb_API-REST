import { Request, Response } from 'express';
import {pool} from '../conf/dbConnection';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

//-----------Interface------------------------------------------------------------------------------
interface ProductBody{
    name: string;
    price:number;
    stock: number;
    description: string;
    brand?: string;
    img?:string;
}
//-----------Validaciones----------------------------------------------------------------------------
const isValidId = (id: any): boolean => {
    const parsed = Number(id);
    return Number.isInteger(parsed) && parsed > 0;
}

const isValidPrice = (price: any): boolean => {
    const parsed = Number(price);
    return !isNaN(parsed) && parsed >0;
}

//----------- get all prodtucs----------------------------------------------------------------------------
export const getAllProducts = async (req: Request, res: Response): Promise<any> => {
    try{
        const isActive = req.query.active !== undefined ? req.query.active === 'true' : true;
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM products WHERE active = ?', [isActive]);
        return res.status(200).json({success: true, data: rows});
    }catch (error){
        return res.status(500).json({success: false, message: 'Error del servidor'});
    }
}
//-----------get product by id----------------------------------------------------------------------------
export const getProductById = async (req: Request, res: Response): Promise<any> => {
    //verificamos que hayan ingresado un id valido
    const {id} = req.params;
    if(!isValidId(id)) return res.status(400).json({success: false, message: 'ID invalido'});
    //intentamos buscar el producto y enviar su informacion
    try{
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM products WHERE id = ? AND active = TRUE', [id]);
        if(rows.length === 0) return res.status(404).json({success: false, message: 'No existe'});
        return res.status(200).json({success: true, data: rows[0]});
    }catch(error){
        return res.status(500).json({success:false, message: 'Error del servidor'});
    }
}
//-----------create product----------------------------------------------------------------------------
export const createProduct = async (req:Request, res:Response): Promise<any> => {
    const {name, price,stock,description,brand,img} = req.body as ProductBody;

    if(!name || !description || stock === undefined || price === undefined) return res.status(400).json({success:false, message: 'Datos incompletos'});
    if(!isValidPrice(price)) return res.status(400).json({success:false, message: 'Precio no valido'});
    
    try{
        const [result] = await pool.query<ResultSetHeader>('INSERT INTO products (name,price,stock,description,brand,img,active) VALUES (?,?,?,?,?,?,TRUE)',[name,Number(price),Number(stock),description,brand || null, img || null]);
        return res.status(201).json({success: true, message: 'Producto creado'}); 
    }catch(error){
        return res.status(500).json({success:false, message: 'Error del servidor'});
    }
}
//-----------update product----------------------------------------------------------------------------
export const updateProduct = async (req:Request, res:Response): Promise<any> => {
    const {id} = req.params;
    const {name, price, stock,description,brand, img} = req.body as ProductBody;

    if(!isValidId(id)) return res.status(400).json({successs:false,message: 'ID no valido'});
    if(!name || !description || stock === undefined || price === undefined) return res.status(400).json({succes:false,message:'Datos incompletos'});
    if(!isValidPrice(price)) return res.status(400).json({success:false,message:'Precio invalido'});

    try{
        const [result] = await pool.query<ResultSetHeader>('UPDATE products SET name=?,price=?,stock=?,description=?,brand=?,img=? WHERE id = ? AND active = TRUE',[name, Number(price),Number(stock),description,brand || null, img || null, id]);
        if(result.affectedRows === 0) return res.status(404).json({success: false, message: 'El producto no existe'});
        return res.status(200).json({success: true, message: 'Prodcuto actualizado'});
    }catch(error){
        return res.status(500).json({success:false, message: 'Error del servidor'});
    }
}
//-----------delete Product----------------------------------------------------------------------------
export const deleteProduct = async (req:Request, res:Response): Promise<any> => {
    const {id} = req.params;
    
    if(!isValidId(id)) return res.status(400).json({success:false, message: 'ID invalido'});

    try{
        const [result] = await pool.query<ResultSetHeader>('UPDATE products SET active = FALSE WHERE id = ? AND active = TRUE', [id]);
        if(result.affectedRows === 0) return res.status(404).json({success:false, message:'El producto no existe'});
        return res.status(200).json({success: true, message: 'Producto eliminado'});
    }catch(error){
        return res.status(500).json({success: false, message: 'Error del servidor'});
    }
}
//-----------change product price----------------------------------------------------------------------------
export const changeProductPrice = async (req:Request, res:Response): Promise<any> => {
    const {id} = req.params;
    const {price} = req.body;

    if(!isValidId(id)) return res.status(400).json({success:false, message:'ID invalido'});
    if(!isValidPrice(price)) return res.status(400).json({success: false, message: 'Precio invalido'});

    try{
        const [result] = await pool.query<ResultSetHeader>('UPDATE products SET price = ? WHERE id = ? AND active = TRUE', [Number(price), id]);
        if(result.affectedRows === 0) return res.status(404).json({success: false, message: 'EL producto no existe'});
        return res.status(200).json({success: true, message:'Precio actualziado'});
    }catch(error){
        return res.status(500).json({success:false, message:'Error del servidor'});
    }
}
