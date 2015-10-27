class A {
    log(msg) {
       console.log(msg);
    }
}

class AA extends A {
    log() {
        super.log(`hello ${msg}`);
    }
}

var a = new AA();

a.log();
