$(document).ready(function () {
    $(".show-details").on("change", function () {
        $(this)
            .closest("tr")
            .next(".details-row")
            .toggleClass("is-visible", this.checked);
  });
  $(".cars-btn").click(function (event) {
    event.preventDefault();
    var selectedCars = $(".select-car:checked");
    if (selectedCars.length > 0) {
      var bookingUrl = new URL(this.href);
      selectedCars.each(function () {
        var cells = $(this).closest("tr").find("td");
        var carName = cells.eq(2).text().trim();
        var dailyRate = cells.eq(4).text().replace(/[^\d]/g, "");
        bookingUrl.searchParams.append("car", carName);
        bookingUrl.searchParams.append("dailyRate", dailyRate);
      });
      window.location.href = bookingUrl.toString();
    } else {
      alert("يجب اختيار سيارة اولاً");
    }
  });
});
function processBooking() {
    // جلب القيم
    var fullName = document.getElementById("fullName").value.trim();
    var mobile = document.getElementById("mobile").value.trim();
    var nationalId = document.getElementById("nationalId").value.trim();
    var email = document.getElementById("email").value.trim();
    var startDate = document.getElementById("startDate").value;
    var endDate = document.getElementById("endDate").value;

     //  جلب نوع السيارة من رابط الصفحة (URL) 
    var urlParams = new URLSearchParams(window.location.search);
    var selectedCars = urlParams.getAll("car").filter(function (car) {
        return car.trim() !== "";
    });
    if (selectedCars.length === 0) {
        selectedCars.push("لم يتم اختيار سيارة مسبقاً");
    }
    var dailyRates = urlParams.getAll("dailyRate").map(function (rate) {
        return Number(rate);
    }).filter(function (rate) {
        return isFinite(rate) && rate > 0;
    });
    var combinedDailyRate = dailyRates.reduce(function (total, rate) {
        return total + rate;
    }, 0);
    var errors = [];
  

    // التحقق من المدخلات الإلزامية
    if (nationalId === "") {
        errors.push("- الرقم الوطني إلزامي.");
    } else if (nationalId.length !== 11 || isNaN(nationalId)) {
        errors.push("- الرقم الوطني يجب أن يتكون من 11 رقماً فقط.");
    }

    if (startDate === "") {
        errors.push("- تاريخ البداية إلزامي.");
    }

    if (endDate === "") {
        errors.push("- تاريخ النهاية إلزامي.");
    }

    // التحقق من المدخلات الاختيارية
    if (mobile !== "" && !/^09[0-9]{8}$/.test(mobile)) {
        errors.push("- رقم الموبايل يجب أن يبدأ بـ 09 ويتكون من 10 أرقام.");
    }

    if (email !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push("- البريد الإلكتروني غير صحيح.");
    }

    // التحقق من التواريخ
    if (startDate !== "" && endDate !== "") {
        var start = new Date(startDate);
        var end = new Date(endDate);

        if (end < start) {
            errors.push("- تاريخ النهاية يجب أن يكون بعد تاريخ البداية أو مساوياً له.");
        }
    }

    // إذا كان هناك أخطاء (حقول فارغة أو خاطئة)
    if (errors.length > 0) {
        alert("يرجى تصحيح الأخطاء التالية:\n" + errors.join("\n"));
        return;
    }

    // الحسابات
    var start = new Date(startDate);
    var end = new Date(endDate);
    var timeDiff = end.getTime() - start.getTime();
    
    // حساب الأيام
    var days = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (days < 1) {
        days = 1;
    }

    var totalBeforeDiscount = days * combinedDailyRate;
    var discount = days > 7 ? totalBeforeDiscount * 0.10 : 0;
    var finalAmount = totalBeforeDiscount - discount;

    function formatMoney(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " ل.س";
    }

    // بناء النص
    var details = "";
    var carLabel = selectedCars.length === 1 ? "السيارة المختارة" : "السيارات المختارة";
    var safeCarNames = selectedCars.map(function (car) {
        return car.replace(/[&<>"']/g, function (character) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            }[character];
        });
    });
    details += "<p><strong>" + carLabel + ":</strong> " + safeCarNames.join("، ") + "</p>";
    details += "<p><strong>الاسم:</strong> " + (fullName === "" ? "غير مدخل" : fullName) + "</p>";
    details += "<p><strong>رقم الموبايل:</strong> " + (mobile === "" ? "غير مدخل" : mobile) + "</p>";
    details += "<p><strong>الرقم الوطني:</strong> " + nationalId + "</p>";
    details += "<p><strong>البريد الإلكتروني:</strong> " + (email === "" ? "غير مدخل" : email) + "</p>";
    details += "<p><strong>تاريخ البداية:</strong> " + startDate + "</p>";
    details += "<p><strong>تاريخ النهاية:</strong> " + endDate + "</p>";
    details += "<p><strong>عدد أيام التأجير:</strong> " + days + " يوم</p>";
    details += "<p><strong>السعر اليومي للسيارة/السيارات المختارة:</strong> " + formatMoney(combinedDailyRate) + "</p>";
    details += "<p><strong>المجموع قبل الخصم:</strong> " + formatMoney(totalBeforeDiscount) + "</p>";
    details += "<p><strong>الخصم" + (days > 7 ? " (10%)" : " (0% - مدة 7 أيام أو أقل)") + ":</strong> " + formatMoney(discount) + "</p>";
    details += "<p><strong>المبلغ النهائي:</strong> " + formatMoney(finalAmount) + "</p>";

    // إظهار النافذة
    document.getElementById("resultDetails").innerHTML = details;
    document.getElementById("resultModal").style.display = "block";
}

function closeModal() {
    document.getElementById("resultModal").style.display = "none";
}

function confirmBooking() {
    document.getElementById("resultModal").style.display = "none";
    alert("تم تأكيد الحجز بنجاح");
}