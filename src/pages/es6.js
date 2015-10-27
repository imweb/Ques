import * as $ from 'jquery';

class A {
	log(msg) {
		console.log(msg);
	}
}

class AA extends A {
	log(name) {
		super.log(`hello ${name}`);
	}
}

var aa = new AA();
aa.log('Donald');

export default aa;