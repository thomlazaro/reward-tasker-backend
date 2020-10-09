exports.encodeToBase64 = (password) => {

  	let buff = new Buffer.alloc(password.length,password);
  	let base64pass = buff.toString("base64");

  	return base64pass;  
	
}
	