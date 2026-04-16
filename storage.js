function guardar(data) {
    localStorage.setItem("app_surtidos", JSON.stringify(data));
  }
  
  function cargar() {
    return JSON.parse(localStorage.getItem("app_surtidos")) || [];
  }