
function userProfilePer(userData){

	let basicDetailsCount = 0;
	let qAaDetailsCount = 0;
	let otherDetailsCount = 0;
	let basicDetails = ['email','name','birth_date','gender','profile_image','interest'];
	let otherDetails = ['about','city','hometown','language','occupation','height','children','edu_qualification','relationship_status','smoking'];

	basicDetails.forEach(element => {
		if (userData.hasOwnProperty(element) && userData[element] != "") basicDetailsCount++;
	});
	otherDetails.forEach(element => {
		if (userData.hasOwnProperty(element) && userData[element] != "") otherDetailsCount++;
	});

	let basicDetailsPer = basicDetailsCount * 40 / basicDetails.length;
	let qAaDetailsPer = userData.question_answer.length * 30 / 5;
	let otherDetailsPer = otherDetailsCount * 30 / otherDetails.length;

	if (basicDetailsPer < 0) basicDetailsPer = 0;
	if (basicDetailsPer > 40) basicDetailsPer = 40;
	if (qAaDetailsPer < 0) qAaDetailsPer = 0;
	if (qAaDetailsPer > 30) qAaDetailsPer = 30;
	if (otherDetailsPer < 0) otherDetailsPer = 0;
	if (otherDetailsPer > 30) otherDetailsPer = 30;

	let profile_per = parseInt(basicDetailsPer) + parseInt(qAaDetailsPer) + parseInt(otherDetailsPer);

	return profile_per;
}

// age calculate function
const getAge = (birthDate) => {
	const age = Math.floor((new Date() - new Date(birthDate).getTime()) / 31557600000);
	return isNaN(age) ? 0 : age;
}

function prependToArray(value, array) {
	var newArray = array.slice();
	newArray.unshift(value);
	return newArray;
}

function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

function convertObjValuesToString(myObj){
	if (Array.isArray(myObj)) {myObj = myObj;}
	else if (typeof myObj == 'object') {
		Object.keys(myObj).forEach(function(key){
			typeof myObj[key] == 'object' ? convertObjValuesToString(myObj[key]) : myObj[key]= String(myObj[key]);
	  	});
	} else {
		myObj = ''
	}
	return myObj
}

module.exports = {
    userProfilePer,
	getAge,
	prependToArray,
	capitalizeFirstLetter,
	convertObjValuesToString
};