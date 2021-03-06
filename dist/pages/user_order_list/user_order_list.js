'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var config = require('../../assets/js/config.js');
var common = require('../../assets/js/common.js');
var login = require('../../assets/js/login.js');
var app = getApp();

// pages/test/test.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 自定义导航
    statusBar: {
      title: '我的订单'
    },
    url: config.url,
    imgUrl: config.imgUrl,
    // tab选项卡
    currentTab: '0',
    page_index: 1,
    page_size: 8,
    status: '',
    user_order_list: [],
    isGroupBuying: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function onLoad(options) {
    var that = this;
    console.log('options', options);
    // 获取自定义导航的整体高度
    that.setData({
      statusBar_height: that.selectComponent('#statusBar')
    });

    if (options.currentTab) {
      that.setData({
        currentTab: options.currentTab
      });
      if (options.isGroupBuying == 'true') {
        that.setData(_defineProperty({
          isGroupBuying: true
        }, 'statusBar.title', '我的团购'));
      }
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function onShow() {
    var that = this;
    if (that.data.currentTab) {

      console.log('currentTab', that.data);
      that.setData({
        page_index: 1,
        page_size: 8,
        user_order_list: [],
        isMore: true
      });
      // 获取我的订单
      that.get_user_order_list();
    } else {
      that.setData({
        page_index: 1,
        page_size: 8,
        user_order_list: [],
        isMore: true
      });
      // 获取我的订单
      that.get_user_order_list();
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function onUnload() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function onPullDownRefresh() {
    console.log('下拉刷新');
    var that = this;
    that.setData({
      page_index: 1,
      page_size: 8,
      user_order_list: [],
      isMore: true
    });
    that.get_user_order_list();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function onReachBottom() {
    console.log('上拉了');
    var that = this;
    // setTimeout模拟加载时间
    setTimeout(function () {
      that.loadMore();
    }, 500);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function onShareAppMessage() {},

  //tab选项卡:用户点击tab时调用
  clickTab: function clickTab(e) {
    var that = this;
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current,
        page_index: 1,
        page_size: 8,
        status: '',
        user_order_list: []
      });
    }
    // 获取我的订单
    that.get_user_order_list();
  },
  // 获取我的订单
  get_user_order_list: function get_user_order_list() {
    // 加载
    common.show_loading();

    var that = this;
    var currentTab = that.data.currentTab;
    var api = 'user_order_list';
    if (that.data.isGroupBuying) {
      api = 'user_group_buying_order_list';
    }

    var urlData = {
      page_index: that.data.page_index,
      page_size: that.data.page_size,
      status: that.data.status
    };

    if (currentTab == 0) {
      // 全部 order_all
      urlData.status = '';
    } else if (currentTab == 1) {
      // 待付款 order_pay
      urlData.status = 1;
    } else if (currentTab == 2) {
      // 待发货 order_send
      urlData.status = 2;
    } else if (currentTab == 3) {
      // 待收货 order_take
      urlData.status = 3;
    } else if (currentTab == 4) {
      // 已完成 order_complete
      urlData.status = 4;
    }

    console.log('urlData', urlData);
    // 我的订单列表
    login.requestP_pro({
      url: '' + (config.postUrl + api),
      data: urlData
    }).then(function (res) {
      console.log('res', res);
      // 停止加载
      common.stop_loading(500);

      // 加载更多:2 拼接新数据
      var old_list = that.data.user_order_list;
      var res_list = res.list;

      // 时间格式处理
      if (res_list) {
        var list = res_list;
        if (list.length > 0) {
          for (var i = 0; i < list.length; i++) {
            var item = list[i];
            var time = common.date_time('date', item.add_time);
            list[i].add_time = time;
          }
        }
      }
      var new_list = old_list.concat(res_list);

      // 加载更多:3 赋值
      that.setData({
        user_order_list: new_list,
        page_index: res.page_index,
        page_size: res.page_size,
        total_count: res.total_count,
        isMore: true
      });

      console.log('user_order_list', that.data.user_order_list);
    }).catch(function (err) {
      common.showErr(err);
    });
  },
  // 修改订单状态
  edit_order_status: function edit_order_status(e) {
    console.log(e);
    var that = this;
    var index = e.currentTarget.dataset.idx;
    // 订单编号
    var order_no = that.data.user_order_list[index].order_no;
    var edit_type = e.currentTarget.dataset.edit_type;
    var urlData = {
      order_no: order_no,
      edit_type: edit_type
    };
    console.log('urlData', urlData);

    var show_msg = '';
    if (urlData.edit_type == 'order_cancel') {
      show_msg = '确定取消订单吗';
    } else if (urlData.edit_type == 'order_complete') {
      show_msg = '是否确认收货';
    }
    wx.showModal({
      title: '提示',
      content: show_msg,
      success: function success(res) {
        if (res.confirm) {
          // 修改订单状态
          login.requestP_pro({
            url: '' + (config.postUrl + 'edit_order_status'),
            data: urlData
          }).then(function (res) {
            console.log('res', res);
            common.alert(res.msg);
            // 重新加载
            that.setData({
              page_index: 1,
              page_size: 8,
              user_order_list: [],
              isMore: true
            });
            that.get_user_order_list();
          }).catch(function (err) {
            common.showErr(err);
          });
        } else if (res.cancel) {
          return false;
        }
      }
    });
  },
  // 加载更多 4：加载更多
  loadMore: function loadMore() {
    var that = this;
    var page_index = that.data.page_index;
    var page_size = that.data.page_size;
    var total_count = that.data.total_count;
    var max_page_index = Math.ceil(total_count / page_size);
    if (total_count > 0) {
      page_index++;
      if (page_index > max_page_index) {
        that.setData({
          page_index: page_index - 1,
          isMore: false
        });
        console.log("当前页码:" + page_index, "最大页码:" + max_page_index);
        console.log("无法加载更多");
        common.alert('没有更多了');
        return false;
      } else {
        that.setData({
          page_index: page_index,
          isMore: true
        });
        console.log("当前页码:" + page_index, "最大页码:" + max_page_index);
        console.log("加载更多");
        // 获取列表
        that.get_user_order_list();
      }
    }
  },

  // 删除订单
  order_delete: function order_delete(e) {
    console.log(e);
    var that = this;
    var index = e.currentTarget.dataset.idx;
    // 订单编号
    var order_no = that.data.user_order_list[index].order_no;
    var edit_type = e.currentTarget.dataset.edit_type;
    var urlData = {
      order_no: order_no
      // edit_type: edit_type,
    };
    console.log('urlData', urlData);

    var show_msg = '';
    if (edit_type == 'order_delete') {
      show_msg = '确定删除订单吗';
    }
    wx.showModal({
      title: '提示',
      content: show_msg,
      success: function success(res) {
        if (res.confirm) {
          login.requestP_pro({
            url: '' + (config.postUrl + 'order_delete'),
            data: urlData
          }).then(function (res) {
            console.log('res', res);
            common.alert(res.msg);
            // 重新加载
            that.setData({
              page_index: 1,
              page_size: 8,
              user_order_list: [],
              isMore: true
            });
            that.get_user_order_list();
          }).catch(function (err) {
            common.showErr(err);
          });
        } else if (res.cancel) {
          return false;
        }
      }
    });
  }

});