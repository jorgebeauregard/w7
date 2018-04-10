var vue = new Vue({
    el:'#app',
    data:{
        shopCarProducts: [{"codigo":"1", "nombre":"hola", "precio":100, "cantidad": 100}],
        inputName: "",
        inputPrice: "",
        inputQuantity: "",
        inputId: -1,
        modifiedFlag: false,
        x:1
    },
    created(){ //called after vue is instanciated
        this.fetchAllValues()
    },
    computed:{ //cached functionsc

    },
    methods:{ //simple functions
        fetchAllValues(){
            axios.get("http://localhost:8081/api/productos")
            /*We can also do this but i hate arrow notation
            .then(response => {
                this.shopCarProducts = response.data;
            })*/
            .then(function (response) {
                this.shopCarProducts = response.data
                console.log("Values updated:")
                console.log(this.shopCarProducts)
            }.bind(this))//according to me....bind keeps the scope of "this" pointing to the vue app instead of the axios static instance that is getting called...so when we do this.something, it is refering to the something inside the vue app and not inside the static axios object
            .catch(function (error) {
                console.log(error)
            });  

        },
        seekProducts(id){
            for(var i = 0; i < this.shopCarProducts.length; i++){
                if(this.shopCarProducts[i].id == id){
                    return i;
                }
            }
            return -1;
        },
        getNextCode(){
            var biggest = 0
            for(var i = 0; i < this.shopCarProducts.length; i++){
                if(this.shopCarProducts[i].codigo > biggest)
                    biggest = this.shopCarProducts[i].codigo
            }
            return biggest+1
        },
        createProduct(){
            if(!this.modifiedFlag){
                if(this.inputName === "" || this.inputPrice === "" || this.inputQuantity === "" ){
                    return
                }
                var obj = {
                    "codigo": this.getNextCode(),
                    "nombre": this.inputName,
                    "precio": this.inputPrice,
                    "exist": this.inputQuantity,
                }
                axios({
                    method: "post",
                    url: "http://localhost:8081/api/createProduct",
                    data: obj
                  })
                  .then(function(response){
                      console.log("Response:")
                      console.log(response)
                      //alert("Data created")
                      this.fetchAllValues()
                      this.clearValues()
                  }.bind(this))
                  .catch(function(error){
                    console.log("Error:")
                    console.log(error)
                })

            }
        },
        updateProduct(){
            if(this.modifiedFlag){
                var obj = {
                    "nombre": this.inputName,
                    "precio": this.inputPrice,
                    "exist": this.inputQuantity,
                }
                axios({
                    method: "put",
                    url: "http://localhost:8081/api/productos/" + this.inputId,
                    data: obj
                })
                .then(function(response){
                    console.log("Response:")
                    console.log(response)
                    //alert("Data created")
                    this.fetchAllValues()
                    this.clearValues()
                }.bind(this))
                .catch(function(error){
                  console.log("Error:")
                  console.log(error)
              })
            }
        },
        deleteProduct(id){
            var index = this.seekProducts(id)
            if(index == -1) return;
            else{
                axios({
                    method: "delete",
                    url: "http://localhost:8081/api/productos/" + id,
                })
                .then(function(response){
                    //alert("Value deleted")
                    this.fetchAllValues()
                }.bind(this))
                .catch(function(error){
                    console.log("Error:")
                    console.log(error)
                })
            }
        },
        setValues(id){
            var index = this.seekProducts(id)
            if(index == -1) return;
            else{
                this.inputId = this.shopCarProducts[index].id
                this.inputName = this.shopCarProducts[index].nombre
                this.inputPrice = this.shopCarProducts[index].precio
                this.inputQuantity = this.shopCarProducts[index].exist
                this.modifiedFlag = true
            }
        },
        clearValues(){
            this.inputId = -1;
            this.inputName = "";
            this.inputPrice = "";
            this.inputQuantity = "";
            this.modifiedFlag = false;
        }
    }
})


