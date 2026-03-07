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

		const ethnicElement = document.getElementById("ethnic");
		if (ethnicElement && formData.ethnic) {
			ethnicElement.textContent = formData.ethnic;
		}

		const tutorDepartmentElement = document.getElementById("tutorDepartment");
		if (tutorDepartmentElement && formData.department) {
			tutorDepartment.textContent = formData.department;
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
	document.getElementById("backBtn").addEventListener("click", () => {
		window.location.href = "index.html";
	});

	// 关闭按钮 - 切换全屏
	document.getElementById("closeBtn").addEventListener("click", async () => {
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
}

// DOM加载完成时初始化
document.addEventListener("DOMContentLoaded", () => {
	initPreviewPage();
});
