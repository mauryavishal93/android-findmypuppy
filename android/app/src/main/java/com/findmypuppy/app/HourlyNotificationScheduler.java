package com.findmypuppy.app;

import android.content.Context;

import androidx.annotation.NonNull;
import androidx.work.Constraints;
import androidx.work.ExistingPeriodicWorkPolicy;
import androidx.work.NetworkType;
import androidx.work.PeriodicWorkRequest;
import androidx.work.WorkManager;

import java.util.concurrent.TimeUnit;

public final class HourlyNotificationScheduler {
    private static final String UNIQUE_WORK_NAME = "findmypuppy_hourly_notifications";

    private HourlyNotificationScheduler() {}

    public static void schedule(@NonNull Context context) {
        Constraints constraints = new Constraints.Builder()
                .setRequiredNetworkType(NetworkType.NOT_REQUIRED)
                .build();

        PeriodicWorkRequest request =
                new PeriodicWorkRequest.Builder(HourlyNotificationWorker.class, 1, TimeUnit.HOURS)
                        .setConstraints(constraints)
                        .build();

        WorkManager.getInstance(context)
                .enqueueUniquePeriodicWork(UNIQUE_WORK_NAME, ExistingPeriodicWorkPolicy.UPDATE, request);
    }
}

