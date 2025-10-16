// 保存数据到localStorage的KEY名称
const STORAGE_KEY = "leaveFormData_v1";

// 使用Unicode安全的编码解码函数
function encodeData(data) {
  return encodeURIComponent(JSON.stringify(data));
}

function decodeData(encodedData) {
  try {
    return JSON.parse(decodeURIComponent(encodedData));
  } catch (e) {
    console.error("解码数据失败:", e);
    return null;
  }
}

// 从localStorage加载表单数据并在预览中显示
function loadFormDataPreview() {
  try {
    const encodedData = localStorage.getItem(STORAGE_KEY);
    if (!encodedData) {
      alert("未找到表单数据，请返回填写表单");
      window.location.href = "index.html";
      return;
    }

    const formData = decodeData(encodedData);
    if (!formData) {
      alert("数据格式错误，请返回重新填写表单");
      window.location.href = "index.html";
      return;
    }

    // 填充预览页面中的所有表单字段
    Object.keys(formData).forEach((key) => {
      // 排除特殊处理的时间字段
      if (key === "sealTime" || key === "applyDateTime") {
        return;
      }

      const element = document.getElementById(key);
      if (element) {
        // 检查是否为表单输入字段或显示span
        if (element.tagName === "INPUT" || element.tagName === "SELECT") {
          element.value = formData[key];
        } else {
          element.textContent = formData[key];
        }
      }
    });

    // 修复HTML中的民族字段
    const ethnicElement = document.getElementById("ethnic");
    if (ethnicElement && formData.ethnic) {
      ethnicElement.textContent = formData.ethnic;
    }

    // 设置印章时间为申请日期当天的00:00
    const sealTimeElement = document.getElementById("sealTime");
    if (sealTimeElement) {
      if (formData.sealTime) {
        sealTimeElement.textContent = formData.sealTime;
      } else if (formData.applyDate) {
        // 如果没有专门的sealTime字段，则从applyDate创建一个00:00格式
        const applyDate = new Date(formData.applyDate);
        const sealTime = `${applyDate.getFullYear()}-${String(applyDate.getMonth() + 1).padStart(2, "0")}-${String(applyDate.getDate()).padStart(2, "0")} 00:00`;
        sealTimeElement.textContent = sealTime;
      }
    }

    // 将辅导员意见日期设置为申请日期（不带时间）
    const tutorDateElement = document.getElementById("tutorDate");
    if (tutorDateElement && formData.applyDate) {
      tutorDateElement.textContent = formData.applyDate;
    }
  } catch (e) {
    console.error("加载预览数据失败:", e);
    alert("加载预览数据失败，请返回重试");
    window.location.href = "index.html";
  }
}

// 初始化预览页面的事件处理
function initPreviewPage() {
  // 加载并显示表单数据
  loadFormDataPreview();

  // 处理返回按钮
  document.getElementById("backBtn").addEventListener("click", function () {
    window.location.href = "index.html";
  });

  // 关闭按钮 - 切换全屏
  document
    .getElementById("closeBtn")
    .addEventListener("click", async function () {
      try {
        const isFS = Boolean(
          document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement,
        );

        if (isFS) {
          // 已在全屏 → 退出
          if (document.exitFullscreen) {
            await document.exitFullscreen();
          } else if (document.webkitExitFullscreen) {
            await document.webkitExitFullscreen();
          } else if (document.mozCancelFullScreen) {
            await document.mozCancelFullScreen();
          } else if (document.msExitFullscreen) {
            await document.msExitFullscreen();
          }
        } else {
          // 进入页面全屏
          const root = document.documentElement;
          if (root.requestFullscreen) {
            await root.requestFullscreen({ navigationUI: "hide" });
          } else if (root.webkitRequestFullscreen) {
            await root.webkitRequestFullscreen();
          } else if (root.mozRequestFullScreen) {
            await root.mozRequestFullScreen();
          } else if (root.msRequestFullscreen) {
            await root.msRequestFullscreen();
          } else {
            throw new Error("浏览器不支持 Fullscreen API");
          }
        }
      } catch (err) {
        console.error("页面全屏切换失败:", err);
        alert("页面全屏切换失败：" + err.message);
      }
    });

  // 处理标签切换
  document.getElementById("tabRegister").addEventListener("click", function () {
    this.classList.add("active");
    document.getElementById("tabProcess").classList.remove("active");
  });

  document.getElementById("tabProcess").addEventListener("click", function () {
    this.classList.add("active");
    document.getElementById("tabRegister").classList.remove("active");
  });

  // 生成16位随机印章ID
  const sealIdElement = document.getElementById("sealId");
  if (
    sealIdElement &&
    (!sealIdElement.textContent ||
      sealIdElement.textContent === "2a24c622f84547ab")
  ) {
    const randomId = (
      Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2)
    ).slice(0, 16);
    sealIdElement.textContent = randomId;
  }

  // 初始化水印
  initMaskGrid();
}

// ===== 水印功能 =====

// 创建水印文本
function createMaskText() {
  try {
    const encodedData = localStorage.getItem(STORAGE_KEY);
    if (!encodedData) return "未找到请假信息";

    const formData = decodeData(encodedData);
    if (!formData || !formData.name) return "未找到姓名信息";

    // 获取当前时间
    const now = new Date();
    const dateTime = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;

    // 返回格式：姓名 日期时间
    return `${formData.name} ${dateTime}`;
  } catch (e) {
    console.error("获取水印信息失败:", e);
    return "水印生成失败";
  }
}

// 初始化水印网格
function initMaskGrid() {
  const formSection = document.querySelector(".mask_divs");
  if (!formSection) return;

  const maskText = createMaskText();
  const maskRows = 15; // 行数
  const maskCols = 2; // 每行2个水印
  const lefts = [10, 260]; // 两列的left位置
  const topStart = 10; // 第一行top位置
  const topStep = 100; // 每行递增100px

  // 清除现有水印
  while (formSection.firstChild) {
    formSection.removeChild(formSection.firstChild);
  }

  // 创建新水印
  for (let row = 0; row < maskRows; row++) {
    for (let col = 0; col < maskCols; col++) {
      const div = document.createElement("div");
      div.className = "mask_div";
      div.innerText = maskText;
      div.style.left = `${lefts[col]}px`;
      div.style.top = `${topStart + row * topStep}px`;
      formSection.appendChild(div);
    }
  }
}

// DOM加载完成时初始化
document.addEventListener("DOMContentLoaded", function () {
  initPreviewPage();
  generateQRCode();
});

// 生成二维码并替换原有的二维码图片
function generateQRCode() {
  try {
    // 从 localStorage 获取数据
    const encodedData = localStorage.getItem(STORAGE_KEY);
    if (!encodedData) {
      console.error("未找到表单数据，无法生成二维码");
      return;
    }

    const formData = decodeData(encodedData);
    if (!formData) {
      console.error("解析表单数据失败，无法生成二维码");
      return;
    }

    // 创建要编码的对象，精简数据以减少二维码复杂度
    const qrDataObj = {
      leaveTime: `${formData.leaveStart} 至 ${formData.leaveEnd}`,
      department: formData.department || "",
      major: formData.major || "",
      class: formData.class || "",
      name: formData.name || "",
      studentId: formData.studentId || "",
    };

    // 使用 LZString 压缩数据，使用更高效的压缩算法
    const compressed = LZString.compressToEncodedURIComponent(
      JSON.stringify(qrDataObj),
    );

    // 创建完整的 URL
    const resultUrl = `https://portal.zzuli.edu.cn/portal/sso/login?url=https%3A%2F%2Fjt.dogxi.me%2Fresult.html?d=${compressed}`;

    // 生成二维码代码
    const typeNumber = 0; // 类型号 (0=自动)
    const errorCorrectionLevel = "L";
    const qr = qrcode(typeNumber, errorCorrectionLevel);
    qr.addData(resultUrl);
    qr.make();

    // 生成二维码图像
    const cellSize = 4; // 每个QR码单元的像素大小
    const margin = 24; // 二维码四周的边距单元数
    const qrImageBase64 = qr.createDataURL(cellSize, margin);

    // 替换页面中的二维码图片，但不更改原有样式
    const qrCodeImage = document.querySelector(".qrcode");
    if (qrCodeImage) {
      qrCodeImage.src = qrImageBase64;
      // 不添加额外样式，保持与原始图片相同的外观
    }

    console.log("二维码生成成功");
  } catch (error) {
    console.error("生成二维码时发生错误:", error);
  }
}
