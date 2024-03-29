export let API_URL;

if (process.env.REACT_APP_STAGE === 'prod') {
  API_URL = 'https://buzz-app-backend.onrender.com/api';
}
if (process.env.REACT_APP_STAGE === 'dev') {
  API_URL = 'http://localhost:5000/api';
}

export const API_CHECKAUTH = `${API_URL}/auth/login/success`;
export const API_GETSUGGESTFRIENDS = `${API_URL}/users/friends/suggestions`;
export const APILIKE_URL = `${API_URL}/posts/like`;
export const APIUNLIKE_URL = `${API_URL}/posts/unlike`;
export const APICOMMENT_URL = `${API_URL}/posts/comment`;
export const APICOMMENTREPLY_URL = `${API_URL}/posts/commentReply`;
export const APICOMMENTLIKE_URL = `${API_URL}/posts/commentLike`;
export const APIREPORT_URL = `${API_URL}/posts/report`;
export const APINEWPOST = `${API_URL}/posts/userPost`;
export const APIGETPOST_URL = `${API_URL}/posts/getPost`;
export const APIDELETEREQ_URL = `${API_URL}/users/deleteRequest/`;
export const APICONFIRMREQ_URL = `${API_URL}/users/confirmRequest/`;
export const APIGOOGLEAUTH_URL = `${API_URL}/auth/google`;
export const APILOCALAUTH_URL = `${API_URL}/auth/login`;
export const APILOGOUT_URL = `${API_URL}/auth/logout`;
export const APIUPDATEUSERDETAILS_URL = `${API_URL}/users/updateUser`;
export const APIUSERINFO_URL = `${API_URL}/users/`;
export const APISENTREQ_URL = `${API_URL}/users/sendRequest/`;
export const APIDELREQ_URL = `${API_URL}/users/deleteRequest/`;
export const API_FEEDFILE_UPLOAD = `https://api.cloudinary.com/v1_1/buzzz-social-app/auto/upload`;
export const API_PROFILE_UPLOAD = `https://api.cloudinary.com/v1_1/buzzz-social-app/image/upload`;
export const API_SEARCH_USER = `${API_URL}/users/search/all`;
