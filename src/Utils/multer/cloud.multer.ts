import multer from "multer";

export const fileValidtion = {
    images : ["image/png" , "image/jpg" , "image/jpeg"],
    videos : ["video/mp4" , "video/3gpp" , "video/quicktime"],
    pdf :["application/pdf"],
    doc :["application/msword" , "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
    
}


export enum StorageEnum{
    MEMORY = "MEMORY",
    DISK = "DISK"
}


export const cloudFileUpload = ({validation = [] , storageApproch = "memory"}: {validation: any[] , storageApproch?: "memory" | "disk"}) => {



   const storage = multer.memoryStorage() || multer.diskStorage();









    return multer ({
        
    })
}