export const catchAsyncErrors = (theFunction) => {
    return (req, res, next) => {
        Promise.resolve(theFunction(req, res, next)).catch(next);
    };
};

//The main purpose of catchAsyncErrors is to simplify error handling for asynchronous functions in Express. Instead of wrapping each async function in a try-catch block, you can use this higher-order function to automatically catch errors and pass them to the next middleware.