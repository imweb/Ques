import * as $ from 'jquery';

class A {
	log(msg: string) {
		console.log(msg);
	}
}

class AA extends A {
	log(name: string) {
		super.log(`hello ${name}`);
	}
}

/**
 * create a AA instance
 */
let createAA: (name: string) => AA = function (name) {
	let aa = new AA();
	aa.log(name);
	return aa;
};

export default createAA('Donald');