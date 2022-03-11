const {getAge} = require('../../../helper/commonHelpers');

const UserResource = (res) => {
	Array.isArray(res) ? res : res=[res];
	let ResponseArray = [];
	
	for (const resData of res) {
		ResponseArray.push(
			{
				"_id": resData._id ? resData._id : "",
				"full_name": resData.full_name ? resData.full_name : "",
				"email": resData.email ? resData.email : "",
				"mobile_no": resData.mobile_no ? resData.mobile_no : "",
				"address": resData.address ? resData.address : "",
				"position_id": resData.position_id ? String(resData.position_id) : "",
				"position_type": resData.position_type ? String(resData.position_type) : "",
				"profile_image": resData.profile_image ? resData.profile_image : "",
				"reg_status": resData.registration_status ? String(resData.registration_status) : "0",
				"reg_date": resData.created_at ? String(resData.created_at) : "0",
				"status": resData.status ? String(resData.status) : "",
				"token": resData.token,
			}
		);
	}
	return ResponseArray;
}

module.exports = UserResource;