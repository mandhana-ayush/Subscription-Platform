module.exports = (req, res)=>{
  if(req.session.ispaid){
    res.redirect('/');
  }
  else{
    next();
  }
}