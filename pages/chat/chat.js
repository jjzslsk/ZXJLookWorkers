// pages/chat/chat.js
const app = getApp();
var emotionObj = require('../../images/chat/emotion/emotion.js');
var userId = '';
var orderId = '';
var otherPayId = '',
  otherPayName = '',
  otherPayAva = '';

var util = require('../../utils/util.js');
var isRequestIng = false; //是否正在请求下一页数据中
var isAlreadyHistory = false;//是否已经获取了历史记录数据
var countdownReques;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isAgainConnet: false,
    webSocketErrHint: '', //连接错误提示
    scrollTop: 0, //距离头部距离
    sendFocus: false,
    showSendBtn: false, //是否显示发送按钮
    showEmotionArea: false, //显示表情包功能区域
    showAttArea: false, //显示附件功能区域
    loadMoreText: '正在加载', //获取历史聊天记录提示
    loadingMore: true, //是否正在加载中
    chatDataList: [], //对话内容
    eomAutoplay: false,
    inputText: '', //输入内容
    emotionData: [],
    emotionList: [], //表情列表
    emotionPath: app.globalData.url + '/photo/zxj_shop_icon/emotion/'
  },

  //请求获取历史记录数据
  getHistoryDataList: function () {
    var that = this;
    if (isAlreadyHistory) return;
    var param = 'userId=' + userId + '&toUserId=' + otherPayId;
    wx.showLoading({
      title: '加载中',
    });
    app.httpsDataPost2('/getImRecord', param,
      function (res) {
        // 成功
        if (res.status) {
          var dataList = res.data;
          var hisDataListTemp = [];
          for (var index in dataList) {
            var hisDataOjb = that.receiveDataPack(dataList[index]);
            if (hisDataOjb != undefined && hisDataOjb != null && hisDataOjb != '') {
              hisDataListTemp.push(hisDataOjb);
            }
          }
          var chatDataList = that.data.chatDataList;
          var tempDataList = hisDataListTemp.concat(chatDataList);
          that.setData({
            chatDataList: tempDataList,
            scrollTop: hisDataListTemp.length * 100
          });
          isAlreadyHistory = true;
        } else {
          wx.showToast({
            title: res.msg + '(' + res.code + ')',
            icon: 'none',
            duration: 2000
          });
        }
      },
      function (returnFrom, res) {
        // 失败
      }
    );

  },

  /**监听滑动事件 */
  onScroll: function (e) {
    const scrollTop = e.detail.scrollTop;
    if (scrollTop < 30 && !isRequestIng) {
      this.getHistoryDataList();
    }
  },

  // 获取容器高度，使页面滚动到容器底部
  scrollToBottom: function () {
    var len = this.data.chatDataList.length //遍历的数组的长度
    this.setData({
      scrollTop: 1000 * len // 这里我们的单对话区域最高1000，取了最大值
    });
  },

  /**点击再次请求创建socket连接 */
  againConnectSocketTap: function (e) {
    var isAgainConnet = this.data.isAgainConnet;
    if (!isAgainConnet) return;
    app.startConnectSocket();
    this.setData({
      isAgainConnet: false,
      webSocketErrHint: '正在连接...'
    });

  },

  /**点击对话框区域 */
  chatTap: function (e) {
    this.setData({
      showAttArea: false,
      showEmotionArea: false
    });
  },

  /**监听搜索框的输入焦点焦点 */
  sendInputFocus: function (e) { },

  /**监听搜索框的失去焦点 */
  sendBlurFocus: function (e) { },

  /**监听搜索框输入内容 */
  sendTextInput: function (e) {
    var showSendBtn = e.detail.value.length > 0 ? true : false;
    this.setData({
      inputText: e.detail.value,
      showSendBtn: showSendBtn
    })
  },

  /**键盘搜索按钮 */
  sendFirm: function (e) {
    this.sentTap();
  },

  /**调起表情列表 */
  emotionTap: function (e) {
    var showEmotionArea = this.data.showEmotionArea;
    this.setData({
      showEmotionArea: !showEmotionArea,
      showAttArea: false
    });
  },

  /**选择标签 */
  emoTap: function (e) {
    var name = e.currentTarget.dataset.name;
    var inputText = this.data.inputText + name;
    this.setData({
      inputText: inputText
    })
  },

  /** 删除表情 */
  emoDelTap: function (e) {
    var inputText = this.data.inputText;
    if (inputText.length > 0) {
      var endStr = inputText.substring(inputText.length - 1, inputText.length);
      if (endStr == ']') {
        var position = inputText.lastIndexOf('[');
        if (position > -1) {
          inputText = inputText.substring(0, position)
        } else {
          inputText = inputText.substring(0, inputText.length - 1)
        }
      } else {
        inputText = inputText.substring(0, inputText.length - 1)
      }

    }
    this.setData({
      inputText: inputText
    })
  },

  /**调起附加功能列表 */
  attTap: function (e) {
    // app.readChatMsgList();
    var showAttArea = this.data.showAttArea;
    this.setData({
      showEmotionArea: false,
      showAttArea: !showAttArea
    });
  },

  /**调用相机或者相册 */
  chooseImage: function (sourceType, maxCount) {
    var that = this;
    wx.chooseImage({
      count: maxCount, //最多可以选择的图片张数
      sizeType: ['original', 'compressed'], //所选的图片的尺寸
      sourceType: sourceType, //选择图片的来源
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths
        that.sentPak(1, '', tempFilePaths)
      }
    })
  },
  /**相机 */
  cameraTap: function (e) {
    this.chooseImage(['camera'], 0);
  },

  /**相册 */
  albumTap: function (e) {
    this.chooseImage(['album'], 5);
  },

  /**上传图片 */
  uploadImgHttps: function (attFkId, imgList, calFun) {
    var that = this;
    var imgUrlListTepm = [];
    for (var index in imgList) {
      var imgPath = imgList[index];
      var attFkName = 'chat_pic';
      var attName = 'chat_pic' + index + '.jpg';
      var tempCount = 0;
      app.uploadFileHttps(userId, attFkId, attFkName, attName, imgPath, function (isSuccess, imgUrlList) {
        tempCount++;
        if (isSuccess) {
          imgUrlListTepm = imgUrlListTepm.concat(imgUrlList);
        }
        if (imgList.length == tempCount) {
          if (imgUrlListTepm == undefined || imgUrlListTepm.length == 0) {
            wx.showToast({
              title: '图片上传失败',
              icon: 'none',
              duration: 2000
            });
            typeof calFun == "function" && calFun(false, null);
          }
          else if (imgUrlListTepm.length < imgList.length) {
            wx.hideLoading();
            wx.showToast({
              title: '提交成功,但部分图片上传失败',
              icon: 'none',
              duration: 2000
            });
            typeof calFun == "function" && calFun(true, imgUrlListTepm);
          } else {
            wx.hideLoading();
            //提交成功
            typeof calFun == "function" && calFun(true, imgUrlListTepm);
          }
        }
      });
    }

  },


  sentStart: function (action, sendObj) {
    var that = this;
    var userInfo = {};
    userInfo.userId = userId;
    userInfo.nickname = app.globalData.userName;
    userInfo.avatar = app.globalData.userAvatar;
    userInfo.sex = app.globalData.sex;
    userInfo.sexName = app.globalData.sex == 0 ? '女' : '男'; //性别名称;

    var sendParam = {};
    sendParam.type = sendObj.type;//1文字，2图片
    sendParam.message = sendObj.type == 2 ? sendObj.imgListContent : sendObj.textContent;//信息
    sendParam.userName = app.globalData.userName; //用户名称
    sendParam.userId = userId; //用户id
    sendParam.toUserId = otherPayId; //接收人id（写用户id，给所有人就all）
    sendParam.toUserName = otherPayName; //接收人名称
    sendParam.data = userInfo;

    //发送消息
    app.onSendSocketChat(sendParam, function (sendIsSuc) {
      if (sendIsSuc) {
        var chatDataList = that.data.chatDataList;
        chatDataList.push(sendObj)
        that.setData({
          chatDataList: chatDataList,
          inputText: action == 0 ? '' : sendObj.textContent,
          showSendBtn: false,
          showEmotionArea: false,
          showAttArea: false,

        });
        that.scrollToBottom();
        app.writeRecordChatByPackag(orderId, otherPayId, otherPayName, otherPayAva, 0, chatDataList);
      }
    });

  },

  /**封装好发送的信息对象 */
  sentPak: function (action, textContent, imgListContent) {
    var that = this;
    //action:0文字，1图片
    var curTime = util.formatTime(new Date());
    var sendObj = {};
    if (imgListContent != undefined && imgListContent.length > 0) {
      wx.showLoading();
      this.uploadImgHttps(userId, imgListContent, function (isPass, imgUrlList) {
        if (isPass) {
          sendObj.type = 2;//type:1文字，2 图片
          sendObj.personType = 'myPary';
          sendObj.personAva = app.globalData.userAvatar;
          sendObj.personName = app.globalData.userName;
          sendObj.textContent = textContent;
          sendObj.imgListContent = imgUrlList;
          sendObj.sendTime = curTime;
          that.sentStart(1, sendObj);
        }
      });
    } else {
      sendObj.type = 1;//type:1文字，2 图片
      sendObj.personType = 'myPary';
      sendObj.personAva = app.globalData.userAvatar;
      sendObj.personName = app.globalData.userName;
      sendObj.textContent = textContent;
      sendObj.imgListContent = imgListContent;
      sendObj.sendTime = curTime;
      that.sentStart(0, sendObj);
    }
  },

  /**发送 */
  sentTap: function (e) {
    var inputText = this.data.inputText.trim();
    
    if (inputText.length > 0) {
      this.sentPak(0, inputText, []);
    }
  },

  //封装接收过来的信息
  receiveDataPack: function (data) {
    var sendType = data.type;//1文字，2图片
    var textMessage = data.textMessage; //接收到的消息
    var fromuserId = data.userId; //发送人id
    var fromusername = data.fromusername; //发送人名称
    var touserId = data.touserId; //接收人id
    var toUserName = data.toUserName; //接收人名称
    var time = data.time; //发送时间
    if (otherPayId != fromuserId) {
      //不是本聊天窗口的消息过滤掉
      return null;
    }

    var fromuserAva = '';
    if (data.data != undefined) {
      var otherInfo = JSON.parse(data.data);
      fromuserAva = otherInfo.avatar;
    }

    var sendObj = {};
    if (fromuserId == userId) {
      sendObj.personType = 'myPary';
      sendObj.personAva = app.globalData.userAvatar;
      sendObj.personName = fromusername;
    } else {
      sendObj.personType = 'otherPary';
      sendObj.personAva = fromuserAva;
      sendObj.personName = fromusername;
    }

    if ((sendType == 2 || sendType == '2') && textMessage != undefined && textMessage.length > 0) {
      textMessage = JSON.parse(textMessage);
      sendObj.textContent = '';
      sendObj.imgListContent = textMessage;
    } else {
      sendObj.textContent = textMessage;
      sendObj.imgListContent = [];
    }
    sendObj.sendTime = time;
    return sendObj
  },

  refreshData: function (emotionData, emotionList) {
    var that = this;
    userId = app.globalData.userId;
    var recordJson = app.readRecordChatCacheBykey(userId + '_chat_' + otherPayId);
    var recordData = app.getChatListfilter(recordJson);
    this.setData({
      chatDataList: recordData,
      emotionData: emotionData,
      emotionList: emotionList
    });
    that.scrollToBottom();

    app.getWebSocketConnectState(
      function (onSocketOpenRes) {
        //WebSocket连接已打开
        that.setData({
          isAgainConnet: false,
          webSocketErrHint: ''
        });
      },
      function (onSocketErrorRes) {
        //监听WebSocket错误
        that.setData({
          isAgainConnet: true,
          webSocketErrHint: '连接异常,点击重新连接试试'
        });
      },
      function (onSocketMessageRes) {
        //接收信息
        var message = onSocketMessageRes.data;
        var messageObj = JSON.parse(message);
        var messageType = messageObj.messageType; //1代表上线 2代表下线 3代表在线名单 4代表普通消息5定位
        if (messageType == 4) {
          var fromuserId = messageObj.userId; //发送人id
          var sendObj = that.receiveDataPack(messageObj);
          if (sendObj != undefined && sendObj != null && sendObj != '') {
            var chatDataList = that.data.chatDataList;
            chatDataList.push(sendObj)
            that.setData({
              chatDataList: chatDataList

            });
            that.scrollToBottom();
            app.upChatUnreadCount(fromuserId);
            app.upChatMsgTabBage();
          }
        }
      },
      function (onSocketCloseRes) {
        //监听WebSocket关闭
        that.setData({
          isAgainConnet: true,
          webSocketErrHint: '连接已关闭,点击重新连接试试'
        });
      }
    );

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;

    orderId = options.orderId;
    otherPayId = options.otherPayId;
    otherPayName = options.otherPayName;
    otherPayAva = options.otherPayAva;
    // otherPayId = 1903141141000740;
    // otherPayName = '罗测试';
    // otherPayAva = '';
    var title = otherPayName == undefined ? '聊一聊' : otherPayName;
    //设置标题
    wx.setNavigationBarTitle({
      title: title
    })

    //每一页显示多少个表情（处了删除的按钮外）
    var eachPageNum = 30;
    //获取表情配置列表
    var emotionData = emotionObj.emotionData;
    //eachPageNum数量为一页，计算能填满多少页
    var intPart = parseInt(emotionData.length / eachPageNum);
    //计算剩下不够一页的表情有多少个
    var remainder = emotionData.length % eachPageNum;

    var emotionList = []
    for (var i = 0; i < intPart; i++) {
      var startPot = i * eachPageNum;
      var endPot = (i + 1) * eachPageNum;
      var pageEmo = emotionData.slice(startPot, endPot);
      emotionList.push(pageEmo);
    }
    if (remainder > 0) {
      var startPot = intPart * eachPageNum;
      var endPot = emotionData.length;
      var remainEmo = emotionData.slice(startPot, endPot);
      emotionList.push(remainEmo);
    }

    if (app.globalData.userInfo == undefined || app.globalData.userInfo == null || app.globalData.userInfo == '') {
      app.wxLogin().then(function (res) {
        that.refreshData(emotionData, emotionList);
      })
    } else {
      that.refreshData(emotionData, emotionList);
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.scrollToBottom();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    app.clearWebSocketConnectState();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})