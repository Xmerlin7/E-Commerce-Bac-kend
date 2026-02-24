const paginate = async (model)=>{
    return(req, res,next) =>{
        const page = req.query.page
        const limit = req.query.page
        const startIndex = (page - 1) * limit;
    }
}