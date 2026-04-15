// 保存数据到localStorage的KEY名称
const STORAGE_KEY = "leaveFormData_v1";
const EXPORT_TARGET_SELECTOR = "#app";
const EXPORT_FILENAME_PREFIX = "学生请假申请表";
const EXPORT_PHONE_VIEWPORT_WIDTH = 402;
const HTML_TO_IMAGE_URL =
	"https://cdnjs.cloudflare.com/ajax/libs/html-to-image/1.11.1/html-to-image.min.js";
const HTML2CANVAS_URL =
	"https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js";

let htmlToImageLoader = null;
let html2CanvasLoader = null;

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
			tutorDepartmentElement.textContent = formData.department;
		}

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

function loadHtml2Canvas() {
	if (window.html2canvas) {
		return Promise.resolve(window.html2canvas);
	}

	if (html2CanvasLoader) {
		return html2CanvasLoader;
	}

	html2CanvasLoader = new Promise((resolve, reject) => {
		const script = document.createElement("script");
		script.src = HTML2CANVAS_URL;
		script.async = true;
		script.onload = () => {
			if (window.html2canvas) {
				resolve(window.html2canvas);
				return;
			}

			reject(new Error("截图组件初始化失败"));
		};
		script.onerror = () => {
			reject(new Error("截图组件加载失败，请检查网络连接后重试"));
		};
		document.head.appendChild(script);
	});

	return html2CanvasLoader;
}

function loadHtmlToImage() {
	if (window.htmlToImage) {
		return Promise.resolve(window.htmlToImage);
	}

	if (htmlToImageLoader) {
		return htmlToImageLoader;
	}

	htmlToImageLoader = new Promise((resolve, reject) => {
		const script = document.createElement("script");
		script.src = HTML_TO_IMAGE_URL;
		script.async = true;
		script.onload = () => {
			if (window.htmlToImage) {
				resolve(window.htmlToImage);
				return;
			}

			reject(new Error("长图导出组件初始化失败"));
		};
		script.onerror = () => {
			reject(new Error("长图导出组件加载失败，请检查网络连接后重试"));
		};
		document.head.appendChild(script);
	});

	return htmlToImageLoader;
}

async function waitForFontsReady() {
	if (!document.fonts || !document.fonts.ready) {
		return;
	}

	try {
		await document.fonts.ready;
	} catch (error) {
		console.warn("字体加载状态获取失败:", error);
	}
}

async function waitForImagesReady(root) {
	const imageElements = Array.from(root.querySelectorAll("img"));

	if (!imageElements.length) {
		return;
	}

	await Promise.all(
		imageElements.map(
			(image) =>
				new Promise((resolve) => {
					if (image.complete) {
						resolve();
						return;
					}

					image.addEventListener("load", resolve, { once: true });
					image.addEventListener("error", resolve, { once: true });
				}),
		),
	);
}

function setExportButtonLoading(button, isLoading) {
	if (!button) {
		return;
	}

	button.disabled = isLoading;
	button.textContent = isLoading ? "正在生成..." : "导出长图";
	button.classList.toggle("is-loading", isLoading);
	document.body.classList.toggle("exporting-long-image", isLoading);
}

function buildExportFileName() {
	const name = document.getElementById("name")?.textContent?.trim();
	const applyDate = document.getElementById("applyDate")?.textContent?.trim();
	const parts = [EXPORT_FILENAME_PREFIX, name, applyDate].filter(Boolean);

	return `${parts.join("-")}.png`;
}

function getExportViewportWidth() {
	return EXPORT_PHONE_VIEWPORT_WIDTH;
}

function createCaptureSandbox() {
	const source = document.querySelector(EXPORT_TARGET_SELECTOR);
	if (!source) {
		throw new Error("未找到可导出的页面内容");
	}

	const exportWidth = getExportViewportWidth();
	const sandbox = document.createElement("div");
	sandbox.className = "capture-sandbox";
	sandbox.setAttribute("aria-hidden", "true");
	sandbox.style.width = `${exportWidth}px`;

		const clone = source.cloneNode(true);
		clone.classList.add("capture-mode");
		clone.style.width = `${exportWidth}px`;
		clone.style.fontFamily = window.getComputedStyle(document.body).fontFamily;

	const clonedExportButton = clone.querySelector("#exportLongImageBtn");
	if (clonedExportButton) {
		clonedExportButton.remove();
	}

	sandbox.appendChild(clone);
	document.body.appendChild(sandbox);

	return { sandbox, clone };
}

function calculateCaptureScale(width, height) {
	const preferredScale = Math.max(2, window.devicePixelRatio || 1);
	const maxPixels = 22000000;
	const safeScale = Math.sqrt(maxPixels / Math.max(width * height, 1));

	return Math.max(1, Math.min(preferredScale, safeScale || 1));
}

function downloadCanvas(canvas, filename) {
	return new Promise((resolve, reject) => {
		canvas.toBlob((blob) => {
			if (!blob) {
				reject(new Error("图片生成失败"));
				return;
			}

			const downloadUrl = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = downloadUrl;
			link.download = filename;
			document.body.appendChild(link);
			link.click();
			link.remove();
			URL.revokeObjectURL(downloadUrl);
			resolve();
		}, "image/png");
	});
}

function hasVisibleContent(canvas) {
	try {
		const context = canvas.getContext("2d", { willReadFrequently: true });
		if (!context) {
			return true;
		}

		const sampleWidth = Math.min(canvas.width, 200);
		const sampleHeight = Math.min(canvas.height, 2000);
		const { data } = context.getImageData(0, 0, sampleWidth, sampleHeight);

		for (let index = 0; index < data.length; index += 16) {
			const red = data[index];
			const green = data[index + 1];
			const blue = data[index + 2];
			const alpha = data[index + 3];

			if (alpha !== 0 && (red < 250 || green < 250 || blue < 250)) {
				return true;
			}
		}

		return false;
	} catch (error) {
		console.warn("无法校验截图内容，跳过空白检测:", error);
		return true;
	}
}

async function renderCaptureCanvas(target, options) {
	try {
		const htmlToImage = await loadHtmlToImage();
		const canvas = await htmlToImage.toCanvas(target, {
			backgroundColor: options.backgroundColor,
			cacheBust: true,
			width: options.width,
			height: options.height,
			canvasWidth: options.width,
			canvasHeight: options.height,
			pixelRatio: options.scale,
			preferredFontFormat: "woff2",
			skipAutoScale: true,
		});

		if (hasVisibleContent(canvas)) {
			return canvas;
		}

		console.warn("html-to-image 导出为空白，回退到 html2canvas");
	} catch (error) {
		console.warn("html-to-image 导出失败，回退到 html2canvas:", error);
	}

	try {
		await loadHtml2Canvas();
		const canvas = await window.html2canvas(target, {
			...options,
			foreignObjectRendering: true,
		});

		if (hasVisibleContent(canvas)) {
			return canvas;
		}

		console.warn("foreignObjectRendering 导出为空白，回退到标准渲染");
	} catch (error) {
		console.warn("foreignObjectRendering 导出失败，回退到标准渲染:", error);
	}

	return window.html2canvas(target, {
		...options,
		foreignObjectRendering: false,
	});
}

async function exportLongImage() {
	const exportButton = document.getElementById("exportLongImageBtn");

	try {
		setExportButtonLoading(exportButton, true);
		await waitForFontsReady();

		const { sandbox, clone } = createCaptureSandbox();

			try {
				await waitForImagesReady(clone);

				const captureWidth = getExportViewportWidth();
				const captureHeight = Math.ceil(clone.scrollHeight);
				const captureScale = calculateCaptureScale(captureWidth, captureHeight);

				const canvas = await renderCaptureCanvas(clone, {
					backgroundColor: "#ffffff",
					scale: captureScale,
					useCORS: true,
					allowTaint: true,
					logging: false,
					width: captureWidth,
					height: captureHeight,
					windowWidth: captureWidth,
					windowHeight: captureHeight,
					scrollX: 0,
					scrollY: 0,
			});

			await downloadCanvas(canvas, buildExportFileName());
		} finally {
			sandbox.remove();
		}
	} catch (error) {
		console.error("导出长图失败:", error);
		alert(`导出长图失败：${error.message}`);
	} finally {
		setExportButtonLoading(exportButton, false);
	}
}

// 初始化预览页面的事件处理
function initPreviewPage() {
	loadFormDataPreview();

	document.getElementById("backBtn").addEventListener("click", () => {
		window.location.href = "index.html";
	});

	document.getElementById("closeBtn").addEventListener("click", async () => {
		try {
			const isFullscreen = Boolean(
				document.fullscreenElement ||
					document.webkitFullscreenElement ||
					document.mozFullScreenElement ||
					document.msFullscreenElement,
			);

			if (isFullscreen) {
				if (document.exitFullscreen) {
					await document.exitFullscreen();
				} else if (document.webkitExitFullscreen) {
					await document.webkitExitFullscreen();
				} else if (document.mozCancelFullScreen) {
					await document.mozCancelFullScreen();
				} else if (document.msExitFullscreen) {
					await document.msExitFullscreen();
				}
				return;
			}

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
		} catch (error) {
			console.error("页面全屏切换失败:", error);
			alert(`页面全屏切换失败：${error.message}`);
		}
	});

	document.getElementById("tabRegister").addEventListener("click", function () {
		this.classList.add("active");
		document.getElementById("tabProcess").classList.remove("active");
	});

	document.getElementById("tabProcess").addEventListener("click", function () {
		this.classList.add("active");
		document.getElementById("tabRegister").classList.remove("active");
	});

	document
		.getElementById("exportLongImageBtn")
		.addEventListener("click", exportLongImage);
}

// DOM加载完成时初始化
document.addEventListener("DOMContentLoaded", () => {
	initPreviewPage();
});
