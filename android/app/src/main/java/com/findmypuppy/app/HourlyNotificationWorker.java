package com.findmypuppy.app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;

import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;
import androidx.work.Worker;
import androidx.work.WorkerParameters;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

public class HourlyNotificationWorker extends Worker {
    private static final String PREFS = "findmypuppy_hourly_notifications";
    private static final String KEY_ORDER = "order_csv";
    private static final String KEY_INDEX = "order_index";
    private static final String KEY_LAST_MESSAGE = "last_message_idx";
    private static final String KEY_NOTIFICATION_ID = "notif_id";
    private static final String KEY_FESTIVE_SENT_DATE_PREFIX = "festive_sent_"; // + festivalKey -> yyyy-MM-dd

    private static final String CHANNEL_ID = "findmypuppy_hourly";
    private static final String CHANNEL_NAME = "Hourly Reminders";

    // Hourly messages (rotate non-repeating until the pool is exhausted, then reshuffle).
    private static final String[] NORMAL_MESSAGES = new String[]{
            "Your puppy is hiding again! Come find it! 🐶",
            "Psst… the puppy needs you! Ready for a quick hunt?",
            "Where’s the puppy? Only you can spot it! 👀",
            "Let’s play hide & seek! Puppy edition 🐾",
            "Your puppy just found a new hiding spot… can you?",
            "Adventure time! Find your furry friend!",
            "Missing puppy alert! Investigate now! 🔍",
            "Your eyes versus the puppy—who wins today?",
            "Quick challenge! Find the pup before anyone else!",
            "The puppy is giggling behind something! Hurry!",
            "New hiding spot unlocked. Can you crack it?",
            "Your streak is waiting. Don’t leave the puppy hanging.",
            "Challenge yourself: fastest time wins!",
            "Master the hunt. Beat your personal best today!",
            "Eyes sharp? Let’s test your spotting skills.",
            "A new round awaits—find the puppy if you can!",
            "Puppy located… Not really. Come prove it!",
            "Got a minute? Beat the puzzle!",
            "Your brain needs a workout—start the hunt!",
            "Real hunters play daily. You in?",
            "Puppy chup gaya! Jaldi dhundo! 🐶",
            "Chalo hide & seek khelein! Puppy bula raha hai!",
            "Arre! Puppy kahaan gaya? Dekh paoge?",
            "Puppy ne naya spot pakda! Dhundh paoge?",
            "Puppy ko dosti chahiye! Khelne aao! 🐾",
            "Puppy muskuraya… ab tumhari baari!",
            "Chhota sa adventure! Puppy ko dhoondo!",
            "Chalo chalo! Puppy ko ghar laana hai!",
            "Puppy mutthi mein lekin dikhta nahi! 👀",
            "Game time! Puppy ko fir se chhupaaya gaya!",
            "Naya challenge! Puppy ko dhoondh ke dikhao!",
            "Skill test time. Aaj ka level clear karoge?",
            "Naya hiding spot unlock hua. Ready ho?",
            "Kya aap puppy ko sabse jaldi dhoondh sakte hain?",
            "Streak mat todiye! Aaj bhi hunt jaiye! 🔍",
            "Eyes on target. Puppy ka pata lagao!",
            "One-minute puzzle! Kya kar paoge?",
            "Master level players daily hunt karte hain!",
            "Aapka score aapka intezaar kar raha hai!",
            "Himmat hai? Puppy ko crack karke dikhaiye!"
    };

    // Festival dates provided by you.
    private static final Map<String, String> FESTIVAL_DATES;
    static {
        FESTIVAL_DATES = new HashMap<>();
        FESTIVAL_DATES.put("diwali", "2026-11-08");
        FESTIVAL_DATES.put("christmas", "2026-12-25");
        FESTIVAL_DATES.put("eid", "2026-03-29");
        FESTIVAL_DATES.put("new_year", "2027-01-01");
    }

    private static final Map<String, String[]> FESTIVAL_MESSAGES;
    static {
        FESTIVAL_MESSAGES = new HashMap<>();
        FESTIVAL_MESSAGES.put("diwali", new String[]{
                "Lights, sweets… and a missing puppy! Celebrate Diwali with a quick hunt 🎆🐶",
                "Puppy ne bhi Diwali manayi aur chup gaya! Dhundh ke pakdo 🎇",
                "Festival bonus unlocked! Find the puppy & claim your Diwali reward!"
        });
        FESTIVAL_MESSAGES.put("christmas", new String[]{
                "Santa left gifts… and a puppy clue! 🎅🎁",
                "Ho Ho Ho! Puppy is hiding under the Christmas magic. Can you spot it?",
                "Snow, bells & hidden pups—Merry Christmas & happy hunting! ❄️🐶"
        });
        // Holi messages included, but no date was provided in FESTIVAL_DATES.
        FESTIVAL_MESSAGES.put("holi", new String[]{
                "Colors everywhere! But where’s the puppy? Dhundo aur rang lagao! 🌈🐶",
                "Holi Surprise! Puppy is hiding with colors—go find it!",
                "Bonus Holi treats inside—start the hunt!"
        });
        FESTIVAL_MESSAGES.put("eid", new String[]{
                "Eidi time! Bonus puppy reward awaits 🌙🐾",
                "Chand raat vibes! Puppy kahaan chup gaya? Jaldi dekho!",
                "Eid Mubarak! Celebrate by finding your furry friend!"
        });
        FESTIVAL_MESSAGES.put("new_year", new String[]{
                "New Year, new hiding spots! 🎉🐶",
                "Kick off your year with a win—find the puppy!",
                "New Year Bonus unlocked—don’t miss it!"
        });
    }

    public HourlyNotificationWorker(@NonNull Context context, @NonNull WorkerParameters params) {
        super(context, params);
    }

    @NonNull
    @Override
    public Result doWork() {
        try {
            ensureChannel();
            String body = pickMessage();
            showNotification(body);
            return Result.success();
        } catch (Exception e) {
            return Result.retry();
        }
    }

    private void ensureChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationManager nm = (NotificationManager) getApplicationContext().getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) return;
        NotificationChannel existing = nm.getNotificationChannel(CHANNEL_ID);
        if (existing != null) return;
        NotificationChannel channel = new NotificationChannel(CHANNEL_ID, CHANNEL_NAME, NotificationManager.IMPORTANCE_DEFAULT);
        channel.setDescription("Hourly reminders to play Find My Puppy");
        nm.createNotificationChannel(channel);
    }

    /**
     * Selection rules:
     * - Hourly: rotate through NORMAL_MESSAGES without repeats until the pool is exhausted.
     * - Festival day: send ONE festive notification per festival per date, then continue normal rotation.
     */
    private String pickMessage() {
        SharedPreferences prefs = getApplicationContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);

        // 1) Festival day one-off
        String today = todayIso();
        String festivalKey = getFestivalKeyForToday(today);
        if (festivalKey != null) {
            String lastSentDate = prefs.getString(KEY_FESTIVE_SENT_DATE_PREFIX + festivalKey, null);
            if (!today.equals(lastSentDate)) {
                String festive = pickFestiveMessageDeterministic(festivalKey, today);
                prefs.edit().putString(KEY_FESTIVE_SENT_DATE_PREFIX + festivalKey, today).apply();
                return festive;
            }
        }

        // 2) Normal non-repeating rotation
        int lastMessageIdx = prefs.getInt(KEY_LAST_MESSAGE, -1);
        List<Integer> order = loadOrCreateOrder(prefs, lastMessageIdx);
        int idx = prefs.getInt(KEY_INDEX, 0);

        if (idx >= order.size()) {
            order = createShuffledOrder(lastMessageIdx);
            idx = 0;
        }

        int msgIdx = order.get(idx);
        prefs.edit()
                .putInt(KEY_INDEX, idx + 1)
                .putInt(KEY_LAST_MESSAGE, msgIdx)
                .putString(KEY_ORDER, toCsv(order))
                .apply();

        return NORMAL_MESSAGES[msgIdx];
    }

    private List<Integer> loadOrCreateOrder(SharedPreferences prefs, int lastMessageIdx) {
        String csv = prefs.getString(KEY_ORDER, null);
        List<Integer> order = fromCsv(csv);
        if (order == null || order.size() != NORMAL_MESSAGES.length) {
            order = createShuffledOrder(lastMessageIdx);
            prefs.edit().putInt(KEY_INDEX, 0).putString(KEY_ORDER, toCsv(order)).apply();
        }
        return order;
    }

    private List<Integer> createShuffledOrder(int lastMessageIdx) {
        List<Integer> list = new ArrayList<>();
        for (int i = 0; i < NORMAL_MESSAGES.length; i++) list.add(i);
        Collections.shuffle(list);
        if (lastMessageIdx >= 0 && list.size() > 1 && list.get(0) == lastMessageIdx) {
            int tmp = list.get(0);
            list.set(0, list.get(1));
            list.set(1, tmp);
        }
        return list;
    }

    private void showNotification(String body) {
        Context ctx = getApplicationContext();
        SharedPreferences prefs = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        int notifId = prefs.getInt(KEY_NOTIFICATION_ID, 1000);
        prefs.edit().putInt(KEY_NOTIFICATION_ID, notifId + 1).apply();

        Intent intent = new Intent(ctx, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);

        PendingIntent pi = PendingIntent.getActivity(
                ctx,
                0,
                intent,
                (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M)
                        ? PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
                        : PendingIntent.FLAG_UPDATE_CURRENT
        );

        NotificationCompat.Builder builder = new NotificationCompat.Builder(ctx, CHANNEL_ID)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentTitle("Find My Puppy")
                .setContentText(body)
                .setStyle(new NotificationCompat.BigTextStyle().bigText(body))
                .setAutoCancel(true)
                .setContentIntent(pi)
                .setPriority(NotificationCompat.PRIORITY_DEFAULT);

        NotificationManager nm = (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm != null) nm.notify(notifId, builder.build());
    }

    private String todayIso() {
        Calendar c = Calendar.getInstance();
        int year = c.get(Calendar.YEAR);
        int month = c.get(Calendar.MONTH) + 1; // 0-based
        int day = c.get(Calendar.DAY_OF_MONTH);
        return String.format(Locale.US, "%04d-%02d-%02d", year, month, day);
    }

    private String getFestivalKeyForToday(String isoDate) {
        for (Map.Entry<String, String> e : FESTIVAL_DATES.entrySet()) {
            if (isoDate.equals(e.getValue())) return e.getKey();
        }
        return null;
    }

    private String pickFestiveMessageDeterministic(String festivalKey, String isoDate) {
        String[] msgs = FESTIVAL_MESSAGES.get(festivalKey);
        if (msgs == null || msgs.length == 0) return NORMAL_MESSAGES[0];
        int h = (festivalKey + ":" + isoDate).hashCode();
        int idx = Math.abs(h) % msgs.length;
        return msgs[idx];
    }

    private static String toCsv(List<Integer> list) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < list.size(); i++) {
            if (i > 0) sb.append(',');
            sb.append(list.get(i));
        }
        return sb.toString();
    }

    private static List<Integer> fromCsv(String csv) {
        if (csv == null || csv.trim().isEmpty()) return null;
        String[] parts = csv.split(",");
        List<Integer> out = new ArrayList<>();
        try {
            for (String p : parts) out.add(Integer.parseInt(p.trim()));
            return out;
        } catch (Exception e) {
            return null;
        }
    }
}

