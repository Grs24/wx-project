// slider_delete.js
/**
 * 显示删除按钮
 */
function showDeleteButton(e, that) {
  let prdIndex = e.currentTarget.dataset.prdIndex
  setXmove(prdIndex, -65, that)
}

/**
 * 隐藏删除按钮
 */
function hideDeleteButton(e, that) {
  let prdIndex = e.currentTarget.dataset.prdIndex
  setXmove(prdIndex, 0, that)
}

/**
 * 设置movable-view位移
 */
function setXmove(prdIndex, xmove, that) {

  let shopCart_list = that.data.shopCart_list
  shopCart_list[prdIndex].xmove = xmove

  that.setData({
    shopCart_list: shopCart_list
  })
  console.log('that.data', that.data)
}

/**
 * 处理movable-view移动事件
 */
function handleMovableChange(e, that) {
  if (e.detail.source === 'friction') {
    if (e.detail.x < -30) {
      showDeleteButton(e, that)
    } else {
      hideDeleteButton(e, that)
    }
  } else if (e.detail.source === 'out-of-bounds' && e.detail.x === 0) {
    hideDeleteButton(e, that)
  }
}

/**
 * 处理touchstart事件
 */
function handleTouchStart(e) {
  that.startX = e.touches[0].pageX
}

/**
 * 处理touchend事件
 */
function handleTouchEnd(e) {
  if (e.changedTouches[0].pageX < that.startX && e.changedTouches[0].pageX - that.startX <= -30) {
    that.showDeleteButton(e)
  } else if (e.changedTouches[0].pageX > that.startX && e.changedTouches[0].pageX - that.startX < 30) {
    that.showDeleteButton(e)
  } else {
    that.hideDeleteButton(e)
  }
}

/**
 * 删除产品
 */
function handleDeletePrd({
  currentTarget: {
    dataset: {
      id
    }
  }
}) {
  let shopCart_list = that.data.shopCart_list
  let prdIndex = shopCart_list.findIndex(item => item.id = id)

  shopCart_list.splice(prdIndex, 1)

  that.setData({
    shopCart_list
  })
  if (shopCart_list[prdIndex]) {
    that.setXmove(prdIndex, 0)
  }
}

/**
 * slide-delete 删除产品
 */
function handleSlideDelete({
  detail: {
    id
  }
}) {
  let slideshopCart_list = that.data.slideshopCart_list
  let prdIndex = slideshopCart_list.findIndex(item => item.id = id)

  slideshopCart_list.splice(prdIndex, 1)

  that.setData({
    slideshopCart_list
  })
}


//export default config;
module.exports = {
  handleDeletePrd: handleDeletePrd,
  handleMovableChange: handleMovableChange,
};