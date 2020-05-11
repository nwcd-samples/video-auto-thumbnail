var AUTH_URL="https://49eqeh4ac6.execute-api.cn-northwest-1.amazonaws.com.cn/prod/auth";
var bucketName="upload-1b4c";
var region="cn-northwest-1";
var path="upload/";


var aws_credentials = {}
var MAX_TRY_COUNT = 3    // 最大尝试次数
var INTERVAL_TIME = 3000  //时间间隔
var current_try_count = 1 //当前尝试次数
var vue ;
$(function(){

  vue = new Vue({
          el: '#main',
          data:{
              thumbnail_image_url:'#'   // 需要刷新的image 地址
           },methods:{
              upload_video_file:function(){
                  upload_video_file()
              }
           }
  })
    get_credentials()
});

function get_credentials(){

     $.ajax({
              async:false,
              type:"get",
              url:AUTH_URL,
              complete: function(response){
                var body= JSON.parse(response.responseText).body;
                aws_credentials = {
                    accessKeyId: body.AccessKeyId,
                    secretAccessKey: body.SecretAccessKey,
                    sessionToken: body.SessionToken
                };  //秘钥形式的登录上传
                console.log(" aws_credentials:   ", aws_credentials)

              },
              error:function(response){
                    //console.log('Error readyState: %d   status: %d ' , response.readyState, response.status)
              }
        })
}


function upload_video_file(){

    var fileChooser = document.getElementById('file-chooser');
    if(fileChooser.files == null || fileChooser.files.length ==0 ){
        alert('请先选择mp4文件')
        return ;
    }

    var file = fileChooser.files[0];
    file_name = file.name.replaceAll(' ', '_')
    //Image 的名称是视频名称加 .jpg
    var image_file_name = file_name.replaceAll(".mp4","nail.jpg")





    console.log('aws_credentials    -------- ++++++++++++ ', aws_credentials);
    AWS.config.update(aws_credentials);
    AWS.config.region = region;   //设置区域
    var bucket = new AWS.S3({params: {Bucket: bucketName}});  //选择桶
    var params = {Key: path+file_name,
                        ContentType: file.type,
                        Body: file, 'Access-Control-Allow-Credentials': '*','ACL': 'public-read'}; //key可以设置为桶的相对路径，Body为文件， ACL最好要设置
    bucket.upload(params, function (err, data) {

        console.log('ERROR ---------------:   ', err);  //打印出错误
        console.log('data ---------------:   ', data);  //打印出错误
        if (!err){
            //FIXME: 将URL替换成 视频上传以后生成的缩略图的URL
            url = "https://"+bucketName+".s3."+region+".amazonaws.com.cn/"+path+"testnail.jpg";
            console.log("URL:"+url);
			setTimeout("get_data('"+url+"')", INTERVAL_TIME)
        }

    });



}


function get_data(url){

    console.log('开始下载图片  第%d次  url: ', current_try_count, url)
    $.ajax({
          async:true,
          type:"get",
          url:url,
          complete: function(response,textStatus){
            if(response.readyState == '4' && response.status == 200){
                console.log('--------------------- 图片存在')
                vue.thumbnail_image_url = url

            }else {
				console.log("response.readyState:"+response.readyState+",response.status="+response.status)
                console.log('--------------------- 图片不存在')
                repeat_update_image( url)
            }
          },
          error:function(response){
                //console.log('Error readyState: %d   status: %d ' , response.readyState, response.status)
          }
    })
}

function repeat_update_image( url){
    current_try_count++
    if(current_try_count > MAX_TRY_COUNT ){
        console.log('视频上传失败， 请重新上传')
        return
    }else {
        setTimeout("get_data('"+url+"')", INTERVAL_TIME)
    }

}
String.prototype.replaceAll = function (FindText, RepText) {
    var regExp = new RegExp(FindText, "g");
    return this.replace(regExp, RepText);
}