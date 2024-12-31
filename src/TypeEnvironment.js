class TypeEnvironment{
    constructor(record = {}, parent = null){
        this.record = record;
        this.parent = parent;
    }

    define(name, type_){
        this.record[name] = type_;
        return type_;
    }

    lookup(name){
        if (!this.record.hasOwnProperty(name)){
            if (this.parent === null){
                throw new ReferenceError(`Variable "${name}" is not defined`);
            }

            return this.parent.lookup(name);
        }

        return this.record[name];
    }
}

module.exports = TypeEnvironment;