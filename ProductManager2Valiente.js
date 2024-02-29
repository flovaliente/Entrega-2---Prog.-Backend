const fs = require('fs').promises;

class ProductManager {
    constructor(pathFile){
        this.pathFile = pathFile;
    }
    async addProduct(product){
        const {title, description, price, thumbnail, code, stock} = product;
        if(!title || !description || !price || !thumbnail || !code || !stock){
            throw new Error('Los campos son obligatorios.');
        }
        const products = await getJSON(this.pathFile);
        if(this.isCodeInUse(products,code))
            throw new Error(`El codigo ${code} ya esta en uso`)
        
        const id = products.length + 1;
        const newProduct = {id, title, description, price, thumbnail, code, stock};
        products.push(newProduct);
        return saveJSON(this.pathFile, products);
    }

    getProducts(){
        return getJSON(this.pathFile);
    }

    isCodeInUse(products ,code){ //funcion para ver si code ya se uso
        return products.some(product => product.code === code);
    }

    async getProductById(id){
        const products = await this.getProducts();
        const product = products.find(product => product.id === id);
        return product ? product : console.warn(`No se encontro ningun producto con el id ${id}`);
    }

    async updateProduct(id, updatedProduct){
        const products = await this.getProducts();
        const position = products.findIndex(product => product.id === id);
        if(position != -1){ // Si no se encontro un producto con el id recibido como parametro
            const updated = {...products[position], ...updatedProduct}; // lo que hace esto es si coincide algun campo, reemplaza los de la izq por los de la derecha
            products[position] = updated; // reemplazo por la actualizacion
            await saveJSON(this.pathFile, products);// guardo en el archivo json
        }
    }

    async deleteProduct(id){
        const products = await this.getProducts();
        const position = products.findIndex(product => product.id === id);
        if(position != -1){
            products.splice(position, 1);// elimino el producto en la posicion
            await saveJSON(this.pathFile, products);
        }
    }
}

// Funciones auxiliares
const existFile = async(pathFile) => {
    try{
        await fs.access(pathFile);
        return true;
    }catch(error){
        return false;
    }
};

const getJSON = async(pathFile) => {
    if(!await existFile(pathFile))
        return [];

    let content;
    try{
        content = await fs.readFile(pathFile, 'utf-8');
    }catch (error){
        throw new Error(`El archivo ${pathFile} no se pudo leer.`);
    }

    try{
        return JSON.parse(content);
    }catch (error){
        throw new Error(`El archivo ${pathFile} no tiene formato valido.`);
    }
};

const saveJSON = async(pathFile, data) =>{
    const content = JSON.stringify(data, null, '\t');
    try{
        await fs.writeFile(pathFile, content, 'utf-8');
    }catch (error){
        throw new Error('El archivo no se pudo escribir');
    }
};

//main
(async function(run){
    if(!run)
        return

    const productManager = new ProductManager('./products.json');
    
    // AGREGAR PRODUCTO
    /*await productManager.addProduct({
        title: "Producto 2",
        description: "Descripcion producto 2",
        price: 22,
        thumbnail: "Sin imagen",
        code: "002",
        stock: 22

    });*/

    //const products = await productManager.getProducts();

   // ACTUALIZAR UN PRODUCTO
    /*const updatedProduct = {
        price: 55
    };*/

    //await productManager.updateProduct(1, updatedProduct); //actualizo el precio del producto con id 1
    //-----------FIN ACTUALIZAR PRODUCTO-----------

    // BORRAR UN PRODUCTO
    //await productManager.deleteProduct(2);

    // MOSTRAR TODOS LOS PRODUCTOS
    const products = await productManager.getProducts();
    console.log('Aca los productos:', products);

    
    // MOSTRAR PRODUCTO SEGUN SU ID
    //console.log(await productManager.getProductById(2));
})(true);
