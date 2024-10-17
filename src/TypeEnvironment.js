class TypeEnvironment{
    constructor(record = {}, parent = null){
        this.record = record;
        this.parent = parent;
    }

    define(name, type){
        this.record[name] = type;
        return type;
    }

    lookup(name){
        if (!this.record.hasOwnProperty(name)){
            throw new ReferenceError(`Variable "${name}" is not defined.`);
        }

        return this.record[name];
    }
}

module.exports = TypeEnvironment;