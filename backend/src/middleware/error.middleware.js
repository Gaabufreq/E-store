


export const errorHandle = (err,req,res,next) =>{
console.log(err);

let errors = null;
// default status
let statusCode = 500;

// default message

let message = "Internal server error"

// mongoose validation error

if(err.name === "ValidationError"){
      statusCode = 400;
      message ="Validation Error"

      errors = {};

      for (const field in err.errors){
        errors[field] = err.errors[field].message;
      }

}

return res.status(statusCode).json({
    success:false,
    message,
    ...(errors && {errors})
})

}