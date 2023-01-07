console.log("hello from extension");
// get current domain
let domain = window.location.hostname;
domain = domain
  .replace("http://", "")
  .replace("https://", "")
  .replace("www.", "")
  .split(/[/?#]/)[0];
// console.log(domain);
const copyToClipBoard = function (str) {
  const input = document.createElement("textarea");
  input.innerHTML = str;
  document.body.appendChild(input);
  input.select();
  const result = document.execCommand("copy");
  document.body.removeChild(input);
  return result;
};
const createEvents = () => {
  document.querySelectorAll("._coupon__list .code").forEach((codeItem) => {
    codeItem.addEventListener("click", (event) => {
      const codeStr = codeItem.innerHTML;
      copyToClipBoard(codeStr);
    });
  });
  document
    .querySelector("._submit-overlay .close")
    .addEventListener("click", () => {
      document.querySelector("._submit-overlay").classList.toggle("hidden");
    });
  document.querySelector("._coupon__button").addEventListener("click", () => {
    document.querySelector("._coupon__list").classList.toggle("hidden");
  });
  document
    .querySelector("._coupon__list .submit-button")
    .addEventListener("click", () => {
      document.querySelector("._submit-overlay").classList.toggle("hidden");
    });
  document
    .querySelector("._submit-overlay .submit-coupon")
    .addEventListener("click", (event) => {
      const code = document.querySelector("._submit-overlay .code").value;
      const desc = document.querySelector("._submit-overlay .desc").value;
      submitCoupon(code, desc, domain);
    });
};
const parseCoupon = (coupons, domain) => {
  try {
    let couponHTML = "";
    for (let key in coupons) {
      const coupon = coupons[key];

      // coupons.forEach((coupon, index) => {
      couponHTML += `
        <li>
          <span class="code">${coupon.code}</span>
          <p>➡ ${coupon.description}</p>
        </li>
      `;
    }
    if (couponHTML === "") {
      couponHTML = `
          <p>Be the first to submit a coupon for this site</p>
        `;
    }
    const couponDisplay = document.createElement("div");
    couponDisplay.className = "_coupon__list hidden";

    couponDisplay.innerHTML = `
        <div class="submit-button">
        Submit Coupon
        </div>
        <h1>Coupons</h1>
        <p>Browse coupons below that have been used from <strong>${domain}</strong></p>
        <p style="font-style:italic;">Click any coupon &amp; use</p>
        <ul>${couponHTML}</ul>
    `;

    document.body.appendChild(couponDisplay);
    const couponButton = document.createElement("div");
    couponButton.className = "_coupon__button";
    couponButton.innerHTML = "C";
    document.body.appendChild(couponButton);

    const couponSubOverlay = document.createElement("div");
    couponSubOverlay.className = "_submit-overlay hidden";
    couponSubOverlay.innerHTML = `
      <span class="close">(x) close</span>
      <h3>Do you have a coupon for this site?</h3>
      <div>
          <label>Code:</label>
          <input type="text" class="code">
      </div>
      <div>
          <label>Description:</label>
          <input type="text" class="desc">
      </div>
      <div>
          <button type="button" class="submit-coupon">Submit</button>
      </div>
    `;
    document.body.appendChild(couponSubOverlay);

    createEvents();
  } catch (error) {
    console.log("no coupon for the domain ", error);
  }
};
const subCouponCallback = (response, domain) => {
  console.log(response);
  document.querySelector("._submit-overlay").classList.toggle("hidden");
  alert("coupon submitted");
};
const submitCoupon = (code, desc, domain) => {
  console.log("submit coupon", { code, desc, domain });
  chrome.runtime.sendMessage(
    { command: "post", data: { code, desc, domain } },
    (response) => {
      subCouponCallback(response, domain);
    }
  );
};
chrome.runtime.sendMessage(
  { command: "fetch", data: { domain } },
  (response) => {
    parseCoupon(response.data, domain);
  }
);
