package com.codehub.backend.service;

import com.codehub.backend.model.SystemSetting;
import com.codehub.backend.repository.SystemSettingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class RegistrationSettingService {

    public static final String KEY_MAX_LIMIT = "MAX_REGISTRATION_LIMIT";
    public static final String KEY_REG_ENABLED = "REGISTRATION_ENABLED";

    public static final int DEFAULT_MAX_LIMIT = 100;
    public static final boolean DEFAULT_REG_ENABLED = true;

    private final SystemSettingRepository systemSettingRepository;

    public int getMaxRegistrationLimit() {
        return systemSettingRepository.findBySettingKey(KEY_MAX_LIMIT)
                .map(setting -> {
                    try {
                        return Integer.parseInt(setting.getSettingValue());
                    } catch (NumberFormatException e) {
                        return DEFAULT_MAX_LIMIT;
                    }
                })
                .orElse(DEFAULT_MAX_LIMIT);
    }

    @Transactional
    public void setMaxRegistrationLimit(int limit) {
        int safeLimit = Math.max(1, limit);
        SystemSetting setting = systemSettingRepository.findBySettingKey(KEY_MAX_LIMIT)
                .orElseGet(() -> SystemSetting.builder().settingKey(KEY_MAX_LIMIT).build());
        setting.setSettingValue(String.valueOf(safeLimit));
        systemSettingRepository.save(setting);
        log.info("Updated registration limit to {}", safeLimit);
    }

    public boolean isRegistrationEnabled() {
        return systemSettingRepository.findBySettingKey(KEY_REG_ENABLED)
                .map(setting -> Boolean.parseBoolean(setting.getSettingValue()))
                .orElse(DEFAULT_REG_ENABLED);
    }

    @Transactional
    public void setRegistrationEnabled(boolean enabled) {
        SystemSetting setting = systemSettingRepository.findBySettingKey(KEY_REG_ENABLED)
                .orElseGet(() -> SystemSetting.builder().settingKey(KEY_REG_ENABLED).build());
        setting.setSettingValue(String.valueOf(enabled));
        systemSettingRepository.save(setting);
        log.info("Updated registration enabled status to {}", enabled);
    }

    public long getRemainingRegistrationSlots(long currentStudents) {
        int max = getMaxRegistrationLimit();
        return Math.max(0, max - currentStudents);
    }

    public boolean canUserRegister(long currentStudents) {
        if (!isRegistrationEnabled()) {
            return false;
        }
        return currentStudents < getMaxRegistrationLimit();
    }
}
