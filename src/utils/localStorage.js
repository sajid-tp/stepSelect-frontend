

export const setItem = (key,value)=>{

    try{
        localStorage.setItem(key,JSON.stringify(value));      
    }catch(error){
        console.log('Error setting the key : ',error)
    }
}


export const getItem = (key) =>{

    try{
          const item = localStorage.getItem(key);
          return item ? JSON.parse(item) : null
    }
    catch(error){
        console.log('The error in getting key is :',error)
        return null;
    }
}

export const removeItem = (key) => {
    try{
      localStorage.removeItem(key)
    }catch(error){
        console.log('The error is :',error);
    }
}

export const clearAll = () =>{
    try{
        localStorage.clear();
    }catch(error){
        console.log('The clear all error is :',error)
    }
}