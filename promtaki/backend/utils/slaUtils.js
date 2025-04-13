/**
 * SLA hesaplama fonksiyonları
 */

/**
 * Belirtilen tarih iş saati içinde mi kontrol eder
 * @param {Date} date - Kontrol edilecek tarih
 * @param {Array} businessHours - İş saatleri bilgisi
 * @param {Array} holidays - Tatil günleri bilgisi
 * @returns {Boolean} İş saati içinde mi?
 */
const isBusinessHours = (date, businessHours, holidays) => {
  // Tatil günü kontrolü
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const isHoliday = holidays.some(holiday => {
    const holidayDate = new Date(holiday.date);
    
    // Tekrarlayan tatil ise sadece gün ve ay kontrolü
    if (holiday.isRecurringYearly) {
      return holidayDate.getMonth() === date.getMonth() &&
             holidayDate.getDate() === date.getDate();
    }
    
    // Tam tarih kontrolü
    return holidayDate.getTime() === dateOnly.getTime();
  });
  
  if (isHoliday) return false;
  
  // Haftanın günü (0: Pazar, 1: Pazartesi, ..., 6: Cumartesi)
  const dayOfWeek = date.getDay();
  
  // İlgili gün için iş saati tanımı
  const dayBusinessHours = businessHours.find(bh => bh.dayOfWeek === dayOfWeek && bh.isWorkingDay);
  
  if (!dayBusinessHours) return false;
  
  // Saat ve dakika
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const timeInMinutes = hours * 60 + minutes;
  
  // Başlangıç saati
  const startHour = parseInt(dayBusinessHours.startTime.split(':')[0]);
  const startMinute = parseInt(dayBusinessHours.startTime.split(':')[1]);
  const startTimeInMinutes = startHour * 60 + startMinute;
  
  // Bitiş saati
  const endHour = parseInt(dayBusinessHours.endTime.split(':')[0]);
  const endMinute = parseInt(dayBusinessHours.endTime.split(':')[1]);
  const endTimeInMinutes = endHour * 60 + endMinute;
  
  // İş saati içinde mi?
  return timeInMinutes >= startTimeInMinutes && timeInMinutes <= endTimeInMinutes;
};

/**
 * Verilen tarihten itibaren sonraki iş saati dilimini bulur
 * @param {Date} startDate - Başlangıç tarihi
 * @param {Array} businessHours - İş saatleri bilgisi
 * @param {Array} holidays - Tatil günleri bilgisi
 * @returns {Object|null} Sonraki iş saati dilimi {start, end} veya null
 */
const findNextBusinessSlot = (startDate, businessHours, holidays) => {
  // İş saati içindeyse mevcut iş saati dilimini döndür
  if (isBusinessHours(startDate, businessHours, holidays)) {
    const dayOfWeek = startDate.getDay();
    const dayBusinessHours = businessHours.find(bh => bh.dayOfWeek === dayOfWeek && bh.isWorkingDay);
    
    // Bitiş saati
    const endHour = parseInt(dayBusinessHours.endTime.split(':')[0]);
    const endMinute = parseInt(dayBusinessHours.endTime.split(':')[1]);
    
    const endDate = new Date(startDate);
    endDate.setHours(endHour, endMinute, 0, 0);
    
    return {
      start: new Date(startDate),
      end: endDate
    };
  }
  
  // İş saati dışındaysa en yakın iş saati dilimini bul
  let currentDate = new Date(startDate);
  let daysChecked = 0;
  
  // En fazla 14 gün ileriye bak (sonsuz döngüden kaçınmak için)
  while (daysChecked < 14) {
    const dayOfWeek = currentDate.getDay();
    const dayBusinessHours = businessHours.find(bh => bh.dayOfWeek === dayOfWeek && bh.isWorkingDay);
    
    // Tatil günü kontrolü
    const dateOnly = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    const isHoliday = holidays.some(holiday => {
      const holidayDate = new Date(holiday.date);
      
      // Tekrarlayan tatil ise sadece gün ve ay kontrolü
      if (holiday.isRecurringYearly) {
        return holidayDate.getMonth() === dateOnly.getMonth() &&
              holidayDate.getDate() === dateOnly.getDate();
      }
      
      // Tam tarih kontrolü
      return holidayDate.getTime() === dateOnly.getTime();
    });
    
    // Çalışma günü ve tatil değilse
    if (dayBusinessHours && !isHoliday) {
      // Başlangıç saati
      const startHour = parseInt(dayBusinessHours.startTime.split(':')[0]);
      const startMinute = parseInt(dayBusinessHours.startTime.split(':')[1]);
      
      // Bitiş saati
      const endHour = parseInt(dayBusinessHours.endTime.split(':')[0]);
      const endMinute = parseInt(dayBusinessHours.endTime.split(':')[1]);
      
      // Mevcut saat
      const currentHour = currentDate.getHours();
      const currentMinute = currentDate.getMinutes();
      const currentTimeInMinutes = currentHour * 60 + currentMinute;
      
      // Başlangıç saati
      const startTimeInMinutes = startHour * 60 + startMinute;
      
      // Bitiş saati
      const endTimeInMinutes = endHour * 60 + endMinute;
      
      // İş saati içinde mi?
      if (currentTimeInMinutes < endTimeInMinutes) {
        // İş saati başlamış mı?
        const slotStartDate = new Date(currentDate);
        
        if (currentTimeInMinutes < startTimeInMinutes) {
          // İş saati henüz başlamamış, başlangıç saatini kullan
          slotStartDate.setHours(startHour, startMinute, 0, 0);
        } else {
          // İş saati içindeyiz, mevcut saati kullan
          slotStartDate.setHours(currentHour, currentMinute, 0, 0);
        }
        
        // Bitiş saati
        const slotEndDate = new Date(currentDate);
        slotEndDate.setHours(endHour, endMinute, 0, 0);
        
        return {
          start: slotStartDate,
          end: slotEndDate
        };
      }
    }
    
    // Sonraki güne geç
    currentDate.setDate(currentDate.getDate() + 1);
    currentDate.setHours(0, 0, 0, 0);
    daysChecked++;
  }
  
  // Hiçbir uygun iş saati bulunamadı
  return null;
};

/**
 * Verilen bir tarihe belirli sayıda iş dakikası ekler
 * @param {Date} startDate - Başlangıç tarihi
 * @param {Number} minutes - Eklenecek dakika sayısı
 * @param {Array} businessHours - İş saatleri bilgisi
 * @param {Array} holidays - Tatil günleri bilgisi
 * @returns {Date} Sonuç tarihi
 */
const addBusinessMinutes = (startDate, minutes, businessHours, holidays) => {
  if (!businessHours || businessHours.length === 0) {
    // İş saatleri tanımlanmamışsa normal dakika ekle
    return new Date(startDate.getTime() + minutes * 60000);
  }
  
  let currentDate = new Date(startDate);
  let remainingMinutes = minutes;
  
  while (remainingMinutes > 0) {
    // Sonraki iş saati dilimini bul
    const nextSlot = findNextBusinessSlot(currentDate, businessHours, holidays);
    
    if (!nextSlot) {
      // Yapılandırılmış iş saati bulunamadı, normal dakika ekle
      currentDate = new Date(currentDate.getTime() + remainingMinutes * 60000);
      break;
    }
    
    const slotStartTime = nextSlot.start;
    const slotEndTime = nextSlot.end;
    const slotDurationMinutes = Math.floor((slotEndTime - slotStartTime) / 60000);
    
    if (remainingMinutes <= slotDurationMinutes) {
      // Kalan dakikalar bu dilim içinde tamamlanabilir
      currentDate = new Date(slotStartTime.getTime() + remainingMinutes * 60000);
      remainingMinutes = 0;
    } else {
      // Bu dilimi tamamen kullan ve sonraki dilime geç
      currentDate = new Date(slotEndTime.getTime());
      remainingMinutes -= slotDurationMinutes;
    }
  }
  
  return currentDate;
};

/**
 * SLA hedef tarihlerini hesaplar
 * @param {Date} startDate - Başlangıç tarihi
 * @param {Number} responseTimeMinutes - Yanıt süresi (dakika)
 * @param {Number} resolutionTimeMinutes - Çözüm süresi (dakika)
 * @param {Boolean} businessHoursOnly - Sadece iş saatleri içinde mi hesaplansın?
 * @param {Array} businessHours - İş saatleri bilgisi
 * @param {Array} holidays - Tatil günleri bilgisi
 * @returns {Object} Yanıt ve çözüm için hedef tarihler
 */
const calculateSLADueDates = (
  startDate, 
  responseTimeMinutes, 
  resolutionTimeMinutes, 
  businessHoursOnly,
  businessHours = [],
  holidays = []
) => {
  let responseDueDate, resolutionDueDate;
  
  if (businessHoursOnly && businessHours.length > 0) {
    // Sadece iş saatleri içinde hesapla
    responseDueDate = addBusinessMinutes(
      startDate,
      responseTimeMinutes,
      businessHours,
      holidays
    );
    
    resolutionDueDate = addBusinessMinutes(
      startDate,
      resolutionTimeMinutes,
      businessHours,
      holidays
    );
  } else {
    // 7/24 hesapla
    responseDueDate = new Date(startDate.getTime() + responseTimeMinutes * 60000);
    resolutionDueDate = new Date(startDate.getTime() + resolutionTimeMinutes * 60000);
  }
  
  return {
    responseDueDate,
    resolutionDueDate
  };
};

/**
 * Belirli bir SLA için son tarih hesaplar
 * @param {Date} startDate - Başlangıç tarihi
 * @param {Number} minutes - Dakika cinsinden SLA süresi
 * @param {Array} businessHours - İş saatleri bilgisi
 * @param {Array} holidays - Tatil günleri bilgisi
 * @returns {Date} Son tarih
 */
const calculateDueDate = (startDate, minutes, businessHours = [], holidays = []) => {
  if (!businessHours || businessHours.length === 0) {
    // İş saatleri tanımlanmamışsa normal dakika ekle (7/24)
    return new Date(startDate.getTime() + minutes * 60000);
  }
  
  // İş saatleri içinde hesapla
  return addBusinessMinutes(startDate, minutes, businessHours, holidays);
};

module.exports = {
  calculateSLADueDates,
  calculateDueDate,
  isBusinessHours,
  findNextBusinessSlot,
  addBusinessMinutes
};
