export const canHire=(hired:string[],id:string,capacity=3)=>hired.length<capacity&&!hired.includes(id)
