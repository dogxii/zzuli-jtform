// 保存数据到localStorage的KEY名称
const STORAGE_KEY = 'leaveFormData_v1';

// 使用Unicode安全的编码解码函数
function encodeData(data) {
  return encodeURIComponent(JSON.stringify(data));
}

function decodeData(encodedData) {
  try {
    return JSON.parse(decodeURIComponent(encodedData));
  } catch (e) {
    console.error('解码数据失败:', e);
    return null;
  }
}

// 保存表单数据到localStorage
function saveFormData() {
  const formData = {};
  const form = document.getElementById('leaveForm');

  // 获取文本输入和选择框
  const textInputs = form.querySelectorAll('input[type="text"], input[type="tel"], input[type="date"], select');
  textInputs.forEach(input => {
    formData[input.id] = input.value;
  });

  // 获取单选按钮
  const radioGroups = ['gender', 'leaveType', 'agent', 'parentAware'];
  radioGroups.forEach(groupName => {
    const checkedRadio = form.querySelector(`input[name="${groupName}"]:checked`);
    formData[groupName] = checkedRadio ? checkedRadio.value : '';
  });

  // 计算请假天数
  const leaveStart = document.getElementById('leaveStart').value;
  const leaveEnd = document.getElementById('leaveEnd').value;

  if (leaveStart && leaveEnd) {
    const start = new Date(leaveStart);
    const end = new Date(leaveEnd);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // 包括开始和结束日
    formData.leaveDays = diffDays;
    document.getElementById('leaveDays').textContent = diffDays;
  }

  // 处理申请日期格式
  const applyDateElement = document.getElementById('applyDate');
  if (applyDateElement && applyDateElement.value) {
    const applyDate = new Date(applyDateElement.value);
    // 保存完整的日期时间，包含当前的小时和分钟
    formData.applyDateTime = `${applyDate.getFullYear()}-${String(applyDate.getMonth() + 1).padStart(2, '0')}-${String(applyDate.getDate()).padStart(2, '0')} ${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`;
    // 保存仅日期部分
    formData.applyDate = applyDateElement.value;
    // 保存用于印章的日期时间（00:00格式）
    formData.sealTime = `${applyDate.getFullYear()}-${String(applyDate.getMonth() + 1).padStart(2, '0')}-${String(applyDate.getDate()).padStart(2, '0')} 00:00`;
  }

  // 保存到localStorage
  try {
    localStorage.setItem(STORAGE_KEY, encodeData(formData));
  } catch (e) {
    console.error('保存数据失败:', e);
  }
}

// 从localStorage加载表单数据
function loadFormData() {
  try {
    const encodedData = localStorage.getItem(STORAGE_KEY);
    if (!encodedData) return;

    const formData = decodeData(encodedData);
    if (!formData) return;

    const form = document.getElementById('leaveForm');

    // 设置文本输入和选择框
    Object.keys(formData).forEach(key => {
      const element = document.getElementById(key);
      if (element && (element.tagName === 'INPUT' || element.tagName === 'SELECT')) {
        element.value = formData[key];
      } else if (key === 'leaveDays') {
        const daysElement = document.getElementById('leaveDays');
        if (daysElement) {
          daysElement.textContent = formData[key];
        }
      }
    });

    // 设置单选按钮
    const radioGroups = ['gender', 'leaveType', 'agent', 'parentAware'];
    radioGroups.forEach(groupName => {
      if (formData[groupName]) {
        const radio = form.querySelector(`input[name="${groupName}"][value="${formData[groupName]}"]`);
        if (radio) {
          radio.checked = true;
        }
      }
    });
  } catch (e) {
    console.error('加载数据失败:', e);
  }
}

// 计算请假天数
function calculateLeaveDays() {
  const leaveStart = document.getElementById('leaveStart').value;
  const leaveEnd = document.getElementById('leaveEnd').value;

  if (leaveStart && leaveEnd) {
    const start = new Date(leaveStart);
    const end = new Date(leaveEnd);

    // 检查结束日期是否晚于开始日期
    if (end < start) {
      alert('结束日期不能早于开始日期');
      document.getElementById('leaveEnd').value = leaveStart;
      document.getElementById('leaveDays').textContent = '1';
      return;
    }

    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // 包括开始和结束日
    document.getElementById('leaveDays').textContent = diffDays;
  }
}

// 表单验证
function validateForm() {
  const requiredFields = [
    { id: 'contact', name: '联系方式' },
    { name: 'gender', type: 'radio', label: '性别' },
    { id: 'ethnic', name: '民族' },
    { name: 'leaveType', type: 'radio', label: '请假类型' },
    { name: 'agent', type: 'radio', label: '是否代请假' },
    { id: 'leaveStart', name: '请假开始时间' },
    { id: 'leaveEnd', name: '请假结束时间' },
    { name: 'parentAware', type: 'radio', label: '家长是否知晓' },
    { id: 'destinationType', name: '请假去向类型' },
    { id: 'destinationDetail', name: '请假去向（具体地点）' },
    { id: 'reason', name: '请假事由' }
  ];

  for (const field of requiredFields) {
    if (field.type === 'radio') {
      const checked = document.querySelector(`input[name="${field.name}"]:checked`);
      if (!checked) {
        alert(`请选择${field.label}`);
        return false;
      }
    } else {
      const element = document.getElementById(field.id);
      if (!element.value.trim()) {
        alert(`请填写${field.name}`);
        element.focus();
        return false;
      }
    }
  }

  return true;
}

// 初始化表单事件
function initForm() {
  // 加载保存的数据
  loadFormData();

  // 设置日期变更事件
  document.getElementById('leaveStart').addEventListener('change', function() {
    calculateLeaveDays();
    saveFormData();
  });

  document.getElementById('leaveEnd').addEventListener('change', function() {
    calculateLeaveDays();
    saveFormData();
  });

  // 为所有输入设置表单变更事件
  const form = document.getElementById('leaveForm');
  const inputs = form.querySelectorAll('input, select');
  inputs.forEach(input => {
    input.addEventListener('change', saveFormData);
    input.addEventListener('blur', saveFormData);
  });

  // 处理下一步按钮点击
  document.getElementById('btnNext').addEventListener('click', function(e) {
    e.preventDefault();
    if (validateForm()) {
      saveFormData();
      window.location.href = 'preview.html';
    }
  });

  // 处理返回按钮
  document.getElementById('backBtn').addEventListener('click', function() {
    history.back();
  });

  // 处理关闭按钮
  document.getElementById('closeBtn').addEventListener('click', function() {
    if (confirm('确定要关闭页面吗？')) {
      window.close();
      // 如果window.close()被阻止的备选方案
      window.location.href = 'about:blank';
    }
  });

  // 处理标签切换
  document.getElementById('tabRegister').addEventListener('click', function() {
    this.classList.add('active');
    document.getElementById('tabProcess').classList.remove('active');
  });

  document.getElementById('tabProcess').addEventListener('click', function() {
    this.classList.add('active');
    document.getElementById('tabRegister').classList.remove('active');
  });

  // 初始计算请假天数
  calculateLeaveDays();

  // 添加页面关闭时自动保存功能
  window.addEventListener('beforeunload', saveFormData);
}

// DOM加载完成时初始化
document.addEventListener('DOMContentLoaded', initForm);
