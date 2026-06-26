// 应用全局状态和配置
const APP_CONFIG = {
  STORAGE_KEY_SHARE_CODE: 'f2f_share_code',
  SHARE_CODE_REGEX: /^[A-Z0-9]{6}$/,
  MAX_FILE_SIZE: 25 * 1024 * 1024,
  API_BASE: '/api'
};

// 保存分享码到本地存储
function saveShareCodeToStorage(code) {
  localStorage.setItem(APP_CONFIG.STORAGE_KEY_SHARE_CODE, code);
}

// 从本地存储获取分享码
function getShareCodeFromStorage() {
  return localStorage.getItem(APP_CONFIG.STORAGE_KEY_SHARE_CODE) || '';
}

// 清除本地存储的分享码
function clearShareCodeFromStorage() {
  localStorage.removeItem(APP_CONFIG.STORAGE_KEY_SHARE_CODE);
}

// 验证分享码格式
function isValidShareCode(code) {
  return APP_CONFIG.SHARE_CODE_REGEX.test(code);
}

// 删除分享文件
async function deleteShareFile(code) {
  try {
    const formData = new FormData();
    formData.append('code', code);
    formData.append('type', 'delete');
    formData.append('action', 'delete');

    const response = await fetch(`${APP_CONFIG.API_BASE}/upload`, {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        clearShareCodeFromStorage();
        return { success: true, message: result.message };
      }
    }
    return { success: false, error: 'Delete failed' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 页面加载时恢复接收端的分享码
function initializeReceiveTab() {
  const savedCode = getShareCodeFromStorage();
  if (savedCode && isValidShareCode(savedCode)) {
    const pickupCodeInput = document.getElementById('pickup-code-input');
    if (pickupCodeInput) {
      pickupCodeInput.value = savedCode;
    }
  }
}

// 处理接收端分享码输入
function handlePickupCodeInput(code) {
  if (isValidShareCode(code)) {
    saveShareCodeToStorage(code);
  }
}

// 初始化事件监听
function initializeEventListeners() {
  // 接收端分享码输入框
  const pickupCodeInput = document.getElementById('pickup-code-input');
  if (pickupCodeInput) {
    pickupCodeInput.addEventListener('change', (e) => {
      handlePickupCodeInput(e.target.value);
    });
    pickupCodeInput.addEventListener('blur', (e) => {
      handlePickupCodeInput(e.target.value);
    });
  }

  // 删除按钮
  const deleteFileBtn = document.getElementById('delete-file-btn');
  if (deleteFileBtn) {
    deleteFileBtn.addEventListener('click', async () => {
      const code = getShareCodeFromStorage();
      if (code && isValidShareCode(code)) {
        if (confirm(t('confirmDelete') || 'Are you sure you want to delete this file?')) {
          const result = await deleteShareFile(code);
          if (result.success) {
            showToast(result.message || 'File deleted successfully', 'success');
            // 清空接收内容
            document.getElementById('pickup-code-input').value = '';
            const contentArea = document.getElementById('content-area');
            if (contentArea) {
              contentArea.innerHTML = '';
            }
          } else {
            showToast(result.error || 'Failed to delete file', 'error');
          }
        }
      }
    });
  }
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeReceiveTab();
    initializeEventListeners();
  });
} else {
  initializeReceiveTab();
  initializeEventListeners();
}
