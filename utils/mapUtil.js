const EARTH_RADIUS = 6378137;
const rad = (d) => d * Math.PI / 180.0; 
const mapUtil = {
    getDistance(lat1, lng1, lat2, lng2){
        if(!lat1 || !lng1 || !lat2 || !lng2){
            return "距离未知";
        }
        lat1 = rad(lat1);
		lng1 = rad(lng1);
		lat2 = rad(lat2);
		lng2 = rad(lng2);
        var distance = Math.acos(Math.cos(lat1) * Math.cos(lng1) * Math.cos(lat2) * Math.cos(lng2) + Math.cos(lat1) * Math.sin(lng1) * Math.cos(lat2) * Math.sin(lng2) + Math.sin(lat1) * Math.sin(lat2)) * EARTH_RADIUS;
        if(~~distance <= 1000){
            return ~~(distance) + "m";
        }else{
            return ~~(distance / 1000) + "km";
        }
    },

    getPurlDistance(lat1, lng1, lat2, lng2) {
      if (!lat1 || !lng1 || !lat2 || !lng2) {
        return -1;
      }
      lat1 = rad(lat1);
      lng1 = rad(lng1);
      lat2 = rad(lat2);
      lng2 = rad(lng2);
      var distance = Math.acos(Math.cos(lat1) * Math.cos(lng1) * Math.cos(lat2) * Math.cos(lng2) + Math.cos(lat1) * Math.sin(lng1) * Math.cos(lat2) * Math.sin(lng2) + Math.sin(lat1) * Math.sin(lat2)) * EARTH_RADIUS;
      return distance;
    }
}
module.exports.mapUtil = mapUtil;  