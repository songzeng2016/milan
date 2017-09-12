/*
1、构造函数 说明
    参数   var com1= new  Comment(this); 
    参数1：执行上下文 
2、组件使用：
   页面调用组件的话需要有变量(必须同名)
*/
import { domain } from '../../utils/domain';
import { wk } from '../../utils/wk';
class Comment{
  // 构造
  constructor(page) {
    this.page = page;
  }

  bindEvents(){
    //删除 元素
    var page=this.page;
    page.delete=(e)=>{
      var commentLists = page.data.commentLists;
      var query = page.data.query;
      var id = e.target.dataset.id;
      console.log(id);
      wx.showModal({
        title: '提示',
        content: '是否确定删除该评论？',
        success: function (res) {
          if (res.confirm && !!id) {
            wk.delete({
              url: '/userComments/'+id,
              openLoading:false,
              success: function (res) {
                var { msg, data, status } = res.data;
                if (msg == 'success') {
                  for (var i = 0; i < commentLists.length; i++) {
                    if (commentLists[i].id == id) {
                      commentLists.splice(i, 1);
                      query.count = query.count - 1;
                      i--;
                      continue;
                    }
                  }
                  var commentCount = page.data.commentCount;
                  page.setData({
                    commentLists: commentLists,
                    query: query,
                    commentCount: commentCount - 1
                  });
                  
                  wx.showToast({
                    title: '评论已删除',
                    icon: 'success',
                    image: '../../image/icon_del.png',
                    mask: true,
                    duration: 1000
                  });
                } else {
                  wx.showToast({
                    title: '删除评论失败',
                    icon: 'loading',
                    image: '../../image/icon_fail.png',
                    mask: true,
                    duration: 1000
                  });
                }
              },
              fail: function (res) {
                wx.showToast({
                  title: '删除评论失败',
                  icon: 'loading',
                  image: '../../image/icon_fail.png',
                  mask: true,
                  duration: 1000
                });
              }
            });
          }
        }
      });
    }
    //其它事件
  }
  //bindEvents :end;
}
//导出组件类
module.exports.Comment = Comment;


