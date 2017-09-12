// pages/commentList/commentList.js
import { hideNickName } from '../../utils/stringUtil';
import { showTimeByDate } from '../../utils/util';
import { domain } from '../../utils/domain';
Page({
  data:{
    commentCount: 0,
    commentList: [],
    pageNo: 1,
    fkId: 0,
    type: 1,
    isToLower: false,
    isLoading: false
  },
  scrollToLowerFn: function () {
    var _this = this;
    this.setData({ isLoading: true });
    this.getCommentList();
  },
  onLoad:function(options){
    var { fkId, type } = options;
    var user = wx.getStorageSync('user_info');
    this.setData({ user: user });
    if(!!fkId){
      this.setData({ fkId: fkId, type: type });
      this.getCommentList();
    }
  },
  //删除评论
  commentDelFn: function (e) {
    var _this = this;
    var id = e.target.dataset.id;
    var commentList = this.data.commentList;
    wx.showModal({
      title: '提示',
      content: '是否确定删除该评论？',
      success: function(res){
        if(res.confirm){
          wx.request({
            url: domain + '/usercomment/delete',
            data: { id: id },
            method: 'GET',
            success: function(res){
              var { msg, data, status } = res.data;
              if(msg == 'success'){
                commentList = commentList.filter((item) => {
                  return item.id != id;
                });
                _this.setData({ commentList: commentList });
                wx.showToast({
                  title: '删除评论成功',
                  icon: 'success',
                  image: '../../image/icon_ok.png',
                  mask: true,
                  duration: 800
                });
              }else{
                wx.showToast({
                  title: '删除评论失败',
                  icon: 'loading',
                  image: '../../image/icon_fail.png',
                  mask: true,
                  duration: 800
                });
              }
            },
            fail: function(res) {
              wx.showToast({
                title: '删除评论失败',
                icon: 'loading',
                image: '../../image/icon_fail.png',
                mask: true,
                duration: 800
              });
            }
          });
        }
      }
    });
  },
  //获取评论分页
  getCommentList(){
    var _this = this;
    var { commentCount, commentList, pageNo, fkId, type } = this.data;
    wx.request({
      url: domain + '/usercomment/list',
      data: { pageSize: 10, currentPage: pageNo, fkId: fkId, type: type },
      method: 'GET',
      success: function(res){
        var { msg, list, query } = res.data;
        list.forEach((item) => {
          item.nickName = hideNickName(item.nickName);
          item.createTime = showTimeByDate(new Date(item.createTime));
        });
        if(msg == 'success'){
          if((!list || list.length <= 0) && pageNo > 1){
            _this.setData({ isToLower: true, isLoading: false });
            setTimeout(function(){
              _this.setData({ isToLower: false });
            }, 500);
          }
          _this.setData({ 
            commentList: commentList.concat(list),
            commentCount: query.count,
            pageNo: pageNo + 1
          });
        }
      },
      complete: function(res){
        setTimeout(function(){
          _this.setData({ isLoading: false });
        }, 500);
      }
    });
  }
});
