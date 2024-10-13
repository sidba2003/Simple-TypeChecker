class Type{
    constructor(name){
        this.name = name;
    }

    getName(){
        return this.name;
    }

    toString(){
        return this.getName();
    }

    equals(other){
        return this.name === other || this === other;
    }
}

Type.number = new Type('number');
Type.string = new Type('string');

module.exports = Type;