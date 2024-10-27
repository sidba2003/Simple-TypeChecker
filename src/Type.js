const TypeEnvironment = require("./TypeEnvironment");

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

    static fromString(typeString){
        if (this.hasOwnProperty(typeString)){
            return this[typeString];
        }

        if (typeString.includes('Fn<')){
            return Type.Function.fromString(typeString);
        }

        throw `Uknown type: ${typeString}`;
    }
}

Type.number = new Type('number');
Type.string = new Type('string');
Type.boolean = new Type('boolean');
Type.null = new Type('null');

Type.Function = class extends Type {
    constructor({name = null, paramTypes, returnType}) {
        super(name);
        this.paramTypes = paramTypes;
        this.returnType = returnType;
        this.name = this.getName();  // This calls getName() to initialize name
    }

    getName() {
        if (this.name === null) {
            // Construct the function type name dynamically
            const name = ['Fn<', this.returnType.getName()];

            if (this.paramTypes.length !== 0) {
                const params = [];
                for (let i = 0; i < this.paramTypes.length; i++) {
                    params.push(this.paramTypes[i].getName());
                }
                name.push('<', params.join(','), '>');
            }

            name.push('>');

            // Here, join the array into a string and assign it to this.name
            this.name = name.join('');
        }
        return this.name;
    }

    equals(other) {
        return this.getName() === other.getName();
    }

    static fromString(typeStr) {
        if (Type.hasOwnProperty(typeStr)) {
            return Type[typeStr];
        }

        // Handle the case with parameters like Fn<number<number, number>>
        let matched = /^Fn<(\w+)<([a-z,\s]+)>>$/.exec(typeStr);

        if (matched != null) {
            const [_, returnTypeStr, paramString] = matched;

            const paramTypes = paramString.split(/,\s*/g).map(param => Type.fromString(param));

            return (Type[typeStr] = new Type.Function({
                name: typeStr,
                paramTypes,
                returnType: Type.fromString(returnTypeStr)
            }));
        }

        // Handle the simple case like Fn<number>
        matched = /^Fn<(\w+)>$/.exec(typeStr);
        if (matched != null) {
            const [_, returnTypeStr] = matched;
            return (Type[typeStr] = new Type.Function({
                name: typeStr,
                paramTypes: [],
                returnType: Type.fromString(returnTypeStr)
            }));
        }

        throw `Type.Function.fromString: Unknown Type: ${typeStr}`;
    }
};

Type.Class = class extends Type {
    constructor({name, superClass = Type.null}){
        super(name);
        this.superClass = superClass;
        this.env = new TypeEnvironment({}, superClass != Type.null ? superClass.env : null);
    }

    getField(name){
        return this.env.lookup(name);
    }

    equals(other){
        if (this ===other){
            return true;
        }

        if (this.superClass != Type.null){
            return this.superClass.equals(other);
        }

        return false;
    }
}


module.exports = Type;