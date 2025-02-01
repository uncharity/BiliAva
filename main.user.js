// ==UserScript==
// @name         B站用户卡片头像原图链接
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  快速查看B站用户头像原图
// @author       uncharity
// @license      MIT
// @match        https://www.bilibili.com/video/*
// @match        https://space.bilibili.com/*
// @icon         https://www.bilibili.com/favicon.ico
// @grant        none
// @run-at       document-idle
// @downloadURL  https://github.com/uncharity/BiliAva/raw/main/main.user.js
// ==/UserScript==

(function () {
  "use strict";
  if (location.host === "space.bilibili.com") {
    const observer = new MutationObserver((mutations) => {
      const spaceAvatar = document.querySelector(".space-avatar");
      if (spaceAvatar) {
        console.log("找到头像元素");
        observer.disconnect();
        if (!spaceAvatar.querySelector(".change-btn")) {
          spaceAvatar.addEventListener("click", function () {
            console.log("点击了头像");
            const srcset = spaceAvatar.querySelector("source").srcset;
            window.open(srcset.split("@")[0], "_blank");
          });
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false,
    });
  } else {
    const targetTagName = "BILI-USER-PROFILE";

    function handleDisplayBlock(element) {
      try {
        const shadowRoot = element.shadowRoot;
        if (!shadowRoot) {
          console.error("shadowRoot 不存在");
          return;
        }

        const checkElement = setInterval(function () {
          const avatar = shadowRoot.querySelector("a#avatar");
          if (avatar) {
            console.log("找到 avatar 元素:", avatar);
            const img = avatar.querySelector("img");
            if (img && img.src) {
              const cleanUrl = img.src.includes("@")
                ? img.src.split("@")[0]
                : img.src;
              avatar.href = cleanUrl;
              console.log("成功更新头像链接:", cleanUrl);
            }
            clearInterval(checkElement);
          }
        }, 100);

        setTimeout(function () {
          clearInterval(checkElement);
          console.log("检查超时，未找到元素");
        }, 5000);
      } catch (error) {
        console.error("处理显示状态时发生错误:", error);
      }
    }

    function addFunctionalityToProfile(element) {
      console.log("为 <bili-user-profile> 添加功能");

      let wasBlock = element.style.display === "block";

      if (wasBlock) {
        handleDisplayBlock(element);
      }

      const styleObserver = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          if (
            mutation.type === "attributes" &&
            mutation.attributeName === "style"
          ) {
            const isBlock = element.style.display === "block";
            if (isBlock && !wasBlock) {
              handleDisplayBlock(element);
            }
            wasBlock = isBlock;
          }
        });
      });

      styleObserver.observe(element, {
        attributes: true,
        attributeFilter: ["style"],
      });
    }

    const observer = new MutationObserver(function (mutationsList) {
      mutationsList
        .filter(function (mutation) {
          return mutation.type === "childList";
        })
        .forEach(function (mutation) {
          mutation.addedNodes.forEach(function (node) {
            if (
              node.nodeType === Node.ELEMENT_NODE &&
              node.tagName === targetTagName
            ) {
              console.log("检测到 <bili-user-profile> 被添加:", node);
              addFunctionalityToProfile(node);
            }
          });
        });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: false,
    });
  }

  console.log("B站用户卡片头像原图链接脚本已加载");
})();
