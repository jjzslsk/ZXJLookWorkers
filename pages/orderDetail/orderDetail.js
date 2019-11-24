// pages/orderDetail/orderDetail.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    detail: '',
    type:'',
    orderId:'',
    level:5,
    attitude:5,
    perform:5,
    pjTag: ['', '', '', ''],
    pjContent:'',
    money:'',//修改的结算金额
    remark:'',//修改结算金额的原因
    pics:[],
    workPics:[],
    pickedWorkerId:'',
    pickedWorkerName: '',
    pickedWorkerAvatar: '',
    balVisible: false,
    planStartDate:'请选择',
    planStartTime:'请选择',
    isAnon:'0',
    stepsList: [{ steps: 1, stepsName: '发布需求' }, { steps: 2, stepsName: '报价订单' }, { steps: 3, stepsName: '开工确认' }, { steps: 4, stepsName: '施工中' }, { steps: 5, stepsName: '竣工确认' }, { steps: 6, stepsName: '竣工完成' }]
  },

  getLocalTime: function (nS) {
    if (nS == undefined || nS == null || nS == '') {
      return '';
    } else {
      Date.prototype.toLocaleString = function () {
        var h = this.getHours()
        if(h<10)
          h='0'+h
        var m = this.getMinutes()
        if (m < 10)
          m = '0' + m
          
        return this.getFullYear() + "-" + (this.getMonth() + 1) + "-" + this.getDate() + ' ' +h + ':' +  m;

      };
      var unixTimestamp = new Date(nS);
      return unixTimestamp.toLocaleString();
    }
  },

  onPFIconTap: function (e) {
    var type = e.currentTarget.dataset.type;
    var num = e.currentTarget.dataset.num;
    if (type =='level'){
      this.setData({
        level: num
      })
    } else if (type == 'attitude') {      
      this.setData({
        attitude: num
      })
    } else if (type == 'perform') {
      this.setData({
        perform: num
      })
    }
  },

  onPJTagTap: function (e) {
    var i = e.currentTarget.dataset.i;
    var content = e.currentTarget.dataset.content;
    var tag = this.data.pjTag
    if (tag[i])
      content=''

    tag[i] = content
    this.setData({
      pjTag: tag
    })
  },

  onInputChange: function (e) {
    var type = e.currentTarget.dataset.type;
    var val = e.detail.value

    if (type == 'pjContent') {
      this.setData({
        pjContent: val
      })
    } else if (type == 'editPrice') {
        this.setData({
          money: val
        })      
    } else if (type == 'editPriceReason') {
      this.setData({
        remark: val
      })
    }
  },

  previewImage: function (e) {
    var type = e.currentTarget.dataset.type
    var i = e.currentTarget.dataset.i
    var pickedImgs = this.data.pics
    if (type=='workPics')
      pickedImgs = this.data.workPics
    wx.previewImage({
      current: pickedImgs[i], // 当前显示图片的http链接
      urls: pickedImgs // 需要预览的图片http链接列表
    })
  },
  

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var id = options.id
    var status = options.status
    var type = options.type
    console.log(status +'::' +type)
    this.setData({
      orderId:id,
      type: type
    })   
    this.initData()
    var title = '订单详情'
    if (status == '0') {
      title = '我的发布'
    } else if (status == '1') {
      title = '报价订单'
    } else if (status == '2') {
      title = '开工确认'
    } else if (status == '3') {
      title = '施工中'
    } else if (status == '4') {
      title = '竣工确认'
    } else if (status == '5') {
      title = '竣工完成'
    }

    wx.setNavigationBarTitle({
      title: title
    })
  },

  initData: function (e) {
    wx.showLoading({
      title: '加载中',
    })
    var that = this
    var param = 'id=' + this.data.orderId
    app.httpsDataGet('/worker/getMyOrderDetail', param,
      function (res) {
        
        res.data.plan_start_date = that.getLocalTime(res.data.plan_start_date)
        res.data.creat_time = that.getLocalTime(res.data.creat_time)
        var pickedWorkerId=''
        var pickedWorkerName = ''
        var pickedWorkerAvatar = ''
        for (var i = 0; i < res.data.biddingPrice.length;i++){
          var biddingPrice = res.data.biddingPrice[i]
          var name = res.data.biddingPrice[i].client_account
          biddingPrice.name = name.substr(0, 1) + '师傅'
          res.data.biddingPrice[i] = biddingPrice

          if (res.data.bidding_price_id == res.data.biddingPrice[i].id){
            pickedWorkerId = res.data.biddingPrice[i].worker_id
            pickedWorkerName = res.data.biddingPrice[i].name
            pickedWorkerAvatar = ''
          }
        }

        for (var i = 0; i < res.data.moneyChange.length; i++) {
          res.data.moneyChange[i].update_time = that.getLocalTime(res.data.moneyChange[i].update_time)
        }

        var pics=[]
        for (var i = 0; i < res.data.pics.length; i++) {
          pics[i] = res.data.pics[i].url
        }

        var workPics = []
        for (var i = 0; i < res.data.workPics.length; i++) {
          workPics[i] = res.data.workPics[i].url
        }

        var title = '订单详情'
        if (res.data.work_status == '0') {
          title = '我的发布'
        } else if (res.data.work_status == '1') {
          title = '报价订单'
        } else if (res.data.work_status == '2') {
          title = '开工确认'
        } else if (res.data.work_status == '3') {
          title = '施工中'
        } else if (res.data.work_status == '4') {
          title = '竣工确认'
        } else if (res.data.work_status == '5') {
          title = '竣工完成'
        }

        wx.setNavigationBarTitle({
          title: title
        })

        if (res.data.workComment && res.data.workComment.tag){
          var tags = res.data.workComment.tag.split(',')
          res.data.workComment.tags=tags
        }

        if (res.data.workerInfo){
          res.data.workerInfo.shortName = res.data.workerInfo.CLIENT_ACCOUNT.substr(0,1)+'师傅'
        }

        console.log('getMyOrderDetail:' + JSON.stringify(res));
        that.setData({
          detail: res.data,
          pics: pics,
          workPics: workPics,
          pickedWorkerId: pickedWorkerId,
          pickedWorkerName: pickedWorkerName,
          pickedWorkerAvatar: pickedWorkerAvatar,
        });

      },
      function (returnFrom, res) {
        //失败
        wx.hideLoading()
      }
    )
  },

  confirmPrice: function (e) {
    var id = e.currentTarget.dataset.id;
    var name = e.currentTarget.dataset.name;
    var price = e.currentTarget.dataset.price;
    var payPrice = price;
    var orderId = this.data.orderId
    var workDate = this.data.detail.plan_start_date
    var workTime = workDate.substr((workDate.length-5),2)
    console.log('workTime:'+workTime)
    var smf=0
    var payTips=''
    var content=''

    if (workTime >= '06' && workTime <= '20') {
      smf = 50
      payTips = '（白天时段最低50，详见发布须知）'
    } else {
      smf = 80
      payTips = '（夜晚时段最低80，详见发布须知）'
    }

    var that = this
    if (price>=500){
      payPrice=500
      payTips = ''
    } else if (price < smf){     
      payPrice = smf      
    }

    content = '该工人的报价为：' + price + '，确认报价后您需支付' + payPrice + '元' + payTips + '。确认接受吗？'
    if (price >= 500) {
      content = '您选择的报价超过500，请您支付定金500元'
    }

    wx.showModal({
      title: '提示',
      content: content,
      success(res) {
        if (res.confirm) {
          
          wx.showLoading({
            title: '提交中',
          })

          var param2 = 'id=' + orderId + '&userId=' + app.globalData.userId + '&biddingPriceId=' + id + '&nextStatus=' + (that.data.detail.work_status+1);
          app.httpsDataGet('/worker/placeTheOrder', param2,
            function (res) {
              console.log('placeTheOrder:' + JSON.stringify(res));
              var orderData=JSON.parse(res.data)
              console.log(orderId+'placeTheOrderorderData:' + JSON.stringify(orderData));
              var bodyStr = '确认工人' + name + '的报价' 
              that.payDialog.showPayDialog(orderId,orderData.orderId, orderData.orderNo, orderData.amount, bodyStr, function (ret) {
                console.log('showPayDialog:' + JSON.stringify(ret));
            
                that.initData()
                

              });
              wx.hideLoading()
            },
            function (returnFrom, res) {
              console.log('placeTheOrdererr:' + JSON.stringify(res));
              //失败
              wx.hideLoading()
            }
          )

          // app.httpsDataGet('/worker/AcceptTheOffer', param2,
          //   function (res) {
          //     console.log('AcceptTheOffer:' + JSON.stringify(res));
          //     wx.hideLoading()
          //     that.initData()
          //   },
          //   function (returnFrom, res) {
          //     console.log('AcceptTheOffererr:' + JSON.stringify(res));
          //     //失败
          //     wx.hideLoading()
          //   }
          // )
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
    
    
  },

  cancelOrder: function (e) {
    var orderId = this.data.orderId
    var status = this.data.detail.work_status
    var that = this

    wx.showModal({
      title: '提示',
      content: '确认取消该订单吗？',
      success(res) {
        if (res.confirm) {

          wx.showLoading({
            title: '提交中',
          })

          if (status == '0' || status == '1'){
            var param = 'id=' + orderId + '&userId=' + app.globalData.userId
            console.log('userWorkerCancelparam:' + param);
            app.httpsDataGet('/worker/userWorkerCancel', param,
              function (res) {
                console.log('userWorkerCancel:' + JSON.stringify(res));
                if (res.status) {
                  wx.showToast({
                    title: '取消订单成功',
                    icon: 'success',
                    duration: 2000
                  })
                  setTimeout(() => {
                    wx.navigateBack({
                      delta: 1
                    })
                  }, 2500);
                }
              },
              function (returnFrom, res) {
                console.log('userWorkerCancelerr:' + JSON.stringify(res));
                //失败
                wx.hideLoading()
              }
            )
          }else{
            var param = 'id=' + orderId + '&userId=' + app.globalData.userId + '&type=9&cancelReason='
            console.log('cancelDemandOrderparam:' + param);
            app.httpsDataGet('/worker/cancleDemandOrder', param,
              function (res) {
                console.log('cancelDemandOrder:' + JSON.stringify(res));
                if (res.status) {
                  wx.showToast({
                    title: '取消订单成功',
                    icon: 'success',
                    duration: 2000
                  })
                  setTimeout(() => {
                    wx.navigateBack({
                      delta: 1
                    })
                  }, 2500);
                }
              },
              function (returnFrom, res) {
                console.log('cancelDemandOrdererr:' + JSON.stringify(res));
                //失败
                wx.hideLoading()
              }
            )
          }
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })


  },

  startWork: function (e) {

    var orderId = this.data.orderId
    var that = this

    wx.showModal({
      title: '提示',
      content: '确认开工吗？请确认工人已到达现场！',
      success(res) {
        if (res.confirm) {

          wx.showLoading({
            title: '提交中',
          })

          var param = 'id=' + orderId + '&userId=' + app.globalData.userId + '&nextStatus=' + (that.data.detail.work_status + 1);

          app.httpsDataGet('/worker/startToWorkOrder', param,
            function (res) {
              console.log('startToWorkOrder:' + JSON.stringify(res));
              if (res.data !='开工成功'){
                var orderData = JSON.parse(res.data.data)
                console.log('startToWorkOrderData:' + JSON.stringify(orderData));
    
                var bodyStr = '确认开工'
                that.payDialog.showPayDialog(orderId,orderData.orderId, orderData.orderNo, orderData.amount, bodyStr, function (ret) {
                  console.log('showPayDialog:' + JSON.stringify(ret));
                  that.initData()
                });
              }else{
                that.initData()
              }
              wx.hideLoading()
            },
            function (returnFrom, res) {
              console.log('startToWorkOrdererr:' + JSON.stringify(res));
              //失败
              wx.hideLoading()
            }
          )
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })


  },

  checkboxChange: function (e) {
    
    if (e.detail.value.length==0){
      this.setData({
        isAnon:'0'
      })
    }else{
      this.setData({
        isAnon: '1'
      })
    }
  },

  confirmWorkDone: function (e) {
    var orderId = this.data.orderId
    var tag = this.data.pjTag
    var tag_str=''
    for (var i = 0; i < tag.length;i++){
      if (tag[i]){
        if (tag_str)
          tag_str += ','+tag[i]
        else
          tag_str += tag[i]
      }
    }
    var that = this
    if (this.data.level==0){
      wx.showToast({
        title: '请给工人技术评分',
        icon:''
      })
      return;
    } else if (this.data.attitude == 0){
      wx.showToast({
        title: '请给工人态度评分',
        icon: ''
      })
      return;
    } else if (this.data.perform == 0) {
      wx.showToast({
        title: '请给工人执行标准评分',
        icon: ''
      })
      return;
    }

    wx.showModal({
      title: '提示',
      content: '确认竣工完成吗？',
      success(res) {
        if (res.confirm) {
          
          wx.showLoading({
            title: '提交中',
          })

          var param = 'id=' + orderId + '&userId=' + app.globalData.userId + '&level=' + that.data.level + '&attitude=' + that.data.attitude + '&perform=' + that.data.perform + '&content=' + that.data.pjContent + '&tag=' + tag_str + '&workerId=' + that.data.detail.worker_id + '&isAnon=' + that.data.isAnon;
          // var param = {
          //   id :orderId,
          //   userId: app.globalData.userId,
          //   level:'5',
          //   attitude:'5',
          //   perform:'5',
          //   content:'非常好',
          //   tag:'技能熟练'
          // }
          console.log('finishWorkOrderparam:' + param);
          app.httpsDataGet('/worker/finishWorkOrder', param,
            function (res) {
              console.log('finishWorkOrder:' + JSON.stringify(res));
              wx.hideLoading()
              that.initData()
            },
            function (returnFrom, res) {
              console.log('finishWorkOrdererr:' + JSON.stringify(res));
              //失败
              wx.hideLoading()
            }
          )
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })


  },

  editPrice: function (e) {
    var money = this.data.money
    var remark = this.data.remark
    if (money == '' || money.match(/^\s+$/g)) {
      wx.showModal({
        title: '提示',
        content: '请输入追加付款金额',
        showCancel: false,
        success: res => { }
      })
      return;
    } else if (remark == '' || remark.match(/^\s+$/g)) {
      wx.showModal({
        title: '提示',
        content: '请输入追加付款理由',
        showCancel: false,
        success: res => { }
      })
      return;
    }

    var editCount=0
    if (this.data.detail.moneyChange.length>0){
      var l = this.data.detail.moneyChange.length-1
      editCount = this.data.detail.moneyChange[l].money
    }
    
    console.log(money +' - '+editCount)

    if (money*1 <= editCount*1) {
      wx.showModal({
        title: '提示',
        content: '您修改的价格不能低于上次报价！请与公匠师傅协商！',
        showCancel: false,
        success: res => { }
      })
      return;
    }

    var orderId = this.data.orderId
    var payAmount = this.data.detail.payAmount
    var payCount = money - payAmount
    if (payCount>0)
      payCount = payCount.toFixed(2)

    var content = '您本订单已支付' + payAmount + '元，请补交追加需求部分' + payCount + '元。您确认提交吗？'
    if (payCount<0)
      content = '需追加付款总款为' + money + '元，您确认提交吗？'

    console.log(payCount)
    var that = this

    wx.showModal({
      title: '提示',
      content: content,
      success(res) {
        if (res.confirm) {

          wx.showLoading({
            title: '提交中',
          })

          var param = 'id=' + orderId + '&userId=' + app.globalData.userId + '&money=' + money + '&remark=' + remark + '&nextStatus=' + that.data.detail.work_status

          app.httpsDataGet('/worker/userChangePriceOrder', param,
            function (res) {
              that.setData({
                money:'',
                remark:''
              })
              console.log('userChangePriceOrder:' + JSON.stringify(res));
              var orderData = JSON.parse(res.data)
              console.log('userChangePriceOrderData:' + JSON.stringify(orderData));

              if (orderData=='0'){
                that.initData()
              }else{
                var bodyStr = '追加付款'
                that.payDialog.showPayDialog(orderId,orderData.orderId, orderData.orderNo, orderData.amount, bodyStr, function (ret) {
                  console.log('showPayDialog:' + JSON.stringify(ret));

                  that.initData()
                  that.setData({
                    money: '',
                    remark: ''
                  })

                });
              }
              wx.hideLoading()
            },
            function (returnFrom, res) {
              console.log('userChangePriceOrdererr:' + JSON.stringify(res));
              //失败
              wx.hideLoading()
              wx.showModal({
                title: '提示',
                content: '修改金额必须比原来大',
                success(res) {
                  if (res.confirm) {
                  
                  } else if (res.cancel) {
                
                  }
                }
              })
            }
          )
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  /**聊一聊 */
  chatTap: function (e) {
    var param = 'orderId=&otherPayId=' + this.data.pickedWorkerId + '&otherPayName=' + this.data.pickedWorkerName + '&otherPayAva=' + this.data.pickedWorkerAvatar
    wx.navigateTo({
      url: '/pages/chat/chat?' + param
    })
  },

  /**指定工人聊一聊 */
  chatTap2: function (e) {
    var id = e.currentTarget.dataset.id;
    var name = e.currentTarget.dataset.name;
    var avatar = e.currentTarget.dataset.name;
    var param = 'orderId=&otherPayId=' + id + '&otherPayName=' + name + '&otherPayAva=' + avatar
    wx.navigateTo({
      url: '/pages/chat/chat?' + param
    })
  },

  openWorkerDetail: function (e) {
    var id = e.currentTarget.dataset.id;
    var name = e.currentTarget.dataset.name;

    var param = 'orderId=&otherPayId=' + id + '&otherPayName=' + name + '&otherPayAva='
    wx.navigateTo({
      url: '/pages/workerDetail/workerDetail?id=' + id
    })
  },

  afterSale: function (e) {
    wx.navigateTo({
      url: '/pages/afterSale/afterSale?orderId=' + this.data.orderId
    })
  },

  editOpenTime: function (e) {
    var that = this
    wx.showModal({
      title: '提示',
      content: '确认修改开工时间吗？',
      success(res) {
        if (res.confirm) {
          that.setData({ balVisible: true })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  handleOk: function () {
    var orderId = this.data.orderId

    var planStartDate = this.data.planStartDate
    var planStartTime = this.data.planStartTime
    if (planStartDate == '请选择') {
      wx.showModal({
        title: '提示',
        content: '请选择开工日期',
        showCancel: false,
        success: res => { }
      })
      return;
    } else if (planStartTime == '请选择') {
      wx.showModal({
        title: '提示',
        content: '请选择开工时间',
        showCancel: false,
        success: res => { }
      })
      return;
    }

    var that=this
    var param = 'id=' + orderId + '&userId=' + app.globalData.userId + '&time=' + planStartDate + ' ' + planStartTime

    app.httpsDataGet('/worker/updateStartingTime', param,
      function (res) {
        wx.showToast({
          title: '修改开工时间成功',
          icon: 'success',
          duration: 2000
        })
        that.initData()
        that.setData({
          balVisible: false
        });
        wx.hideLoading()
      },
      function (returnFrom, res) {
        console.log('userChangePriceOrdererr:' + JSON.stringify(res));
        //失败
        wx.hideLoading()
      }
    )
  },

  showRemark:function(e) {
    var content = e.currentTarget.dataset.content;
    if (content){
      wx.showModal({
        title: '调整金额原因',
        content: content,
        showCancel:false,
        success(res) {

        }
      })
    }
  },

  refreshEditList: function (e) {
    this.initData()
  },

  handleClose() {
    this.setData({
      balVisible: false
    });
  },

  bindDateChange: function (e) {
    this.setData({
      planStartDate: e.detail.value
    })
  },

  bindTimeChange: function (e) {
    this.setData({
      planStartTime: e.detail.value
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.payDialog = this.selectComponent("#payDialog");
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