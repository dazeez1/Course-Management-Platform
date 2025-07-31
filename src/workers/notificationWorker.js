const redisClient = require("../config/redis");
const {
  User,
  ActivityTracker,
  CourseAllocation,
  Course,
  Cohort,
} = require("../models");

class NotificationWorker {
  constructor() {
    this.isRunning = false;
    this.reminderQueue = "facilitator_reminders";
    this.alertQueue = "manager_notifications";
  }

  async start() {
    if (this.isRunning) {
      console.log("Notification worker is already running");
      return;
    }

    this.isRunning = true;
    console.log("🚀 Starting notification worker...");

    // Start processing queues
    this.processReminders();
    this.processAlerts();

    // Schedule weekly reminder checks
    this.scheduleWeeklyReminders();
  }

  async stop() {
    this.isRunning = false;
    console.log("🛑 Stopping notification worker...");
  }

  // Process facilitator reminders for missing submissions
  async processReminders() {
    while (this.isRunning) {
      try {
        // Check for pending reminders
        const reminder = await redisClient.brPop(this.reminderQueue, 5);

        if (reminder && reminder.length > 0) {
          const reminderData = JSON.parse(reminder[1]);
          await this.sendFacilitatorReminder(reminderData);
        }
      } catch (error) {
        console.error("Error processing reminders:", error);
        await this.sleep(5000); // Wait 5 seconds before retrying
      }
    }
  }

  // Process manager alerts for activity log events
  async processAlerts() {
    while (this.isRunning) {
      try {
        // Check for pending alerts
        const alert = await redisClient.brPop(this.alertQueue, 5);

        if (alert && alert.length > 0) {
          const alertData = JSON.parse(alert[1]);
          await this.sendManagerAlert(alertData);
        }
      } catch (error) {
        console.error("Error processing alerts:", error);
        await this.sleep(5000); // Wait 5 seconds before retrying
      }
    }
  }

  // Send reminder to facilitator for missing submission
  async sendFacilitatorReminder(reminderData) {
    try {
      const { facilitatorId, weekNumber, academicYear, allocationId } =
        reminderData;

      const facilitator = await User.findByPk(facilitatorId);
      const allocation = await CourseAllocation.findByPk(allocationId, {
        include: [
          {
            model: Course,
            as: "course",
            attributes: ["courseCode", "courseTitle"],
          },
          { model: Cohort, as: "cohort", attributes: ["cohortName"] },
        ],
      });

      if (!facilitator || !allocation) {
        console.log(`Reminder skipped - facilitator or allocation not found`);
        return;
      }

      const message = {
        type: "reminder",
        recipient: facilitator.emailAddress,
        subject: `Weekly Activity Log Reminder - Week ${weekNumber}`,
        body: `Dear ${facilitator.firstName} ${facilitator.lastName},

This is a friendly reminder that your weekly activity log for Week ${weekNumber} (${academicYear}) is due.

Course: ${allocation.course.courseCode} - ${allocation.course.courseTitle}
Cohort: ${allocation.cohort.cohortName}

Please submit your activity log as soon as possible to ensure compliance with institutional requirements.

Best regards,
Course Management System`,
        timestamp: new Date().toISOString(),
      };

      console.log(
        `📧 Reminder sent to ${facilitator.emailAddress}:`,
        message.subject
      );

      await this.logNotification("reminder", message);
    } catch (error) {
      console.error("Error sending facilitator reminder:", error);
    }
  }

  // Send alert to managers for activity log events
  async sendManagerAlert(alertData) {
    try {
      const { type, action, logId, facilitatorId, weekNumber, academicYear } =
        alertData;

      const facilitator = await User.findByPk(facilitatorId);
      const activityLog = await ActivityTracker.findByPk(logId, {
        include: [
          {
            model: CourseAllocation,
            as: "courseAllocation",
            include: [
              {
                model: Course,
                as: "course",
                attributes: ["courseCode", "courseTitle"],
              },
              { model: Cohort, as: "cohort", attributes: ["cohortName"] },
            ],
          },
        ],
      });

      if (!facilitator || !activityLog) {
        console.log(`Alert skipped - facilitator or activity log not found`);
        return;
      }

      // Get all managers
      const managers = await User.findAll({
        where: { userRole: "manager", isActive: true },
        attributes: ["emailAddress", "firstName", "lastName"],
      });

      const actionText =
        {
          submitted: "submitted",
          updated: "updated",
          deleted: "deleted",
        }[action] || action;

      const message = {
        type: "alert",
        recipients: managers.map((m) => m.emailAddress),
        subject: `Activity Log ${
          actionText.charAt(0).toUpperCase() + actionText.slice(1)
        } - Week ${weekNumber}`,
        body: `Dear Manager,

An activity log has been ${actionText} by ${facilitator.firstName} ${
          facilitator.lastName
        }.

Details:
- Week: ${weekNumber}
- Academic Year: ${academicYear}
- Course: ${activityLog.courseAllocation.course.courseCode} - ${
          activityLog.courseAllocation.course.courseTitle
        }
- Cohort: ${activityLog.courseAllocation.cohort.cohortName}
- Action: ${actionText}
- Timestamp: ${new Date().toISOString()}

Please review the submission in the system.

Best regards,
Course Management System`,
        timestamp: new Date().toISOString(),
      };

      console.log(
        `🚨 Alert sent to ${managers.length} managers:`,
        message.subject
      );

      await this.logNotification("alert", message);
    } catch (error) {
      console.error("Error sending manager alert:", error);
    }
  }

  // Schedule weekly reminder checks for missing submissions
  async scheduleWeeklyReminders() {
    setInterval(async () => {
      if (!this.isRunning) return;

      try {
        await this.checkMissingSubmissions();
      } catch (error) {
        console.error("Error checking missing submissions:", error);
      }
    }, 24 * 60 * 60 * 1000); // Check every 24 hours
  }

  // Check for facilitators who haven't submitted logs for the current week
  async checkMissingSubmissions() {
    try {
      const currentDate = new Date();
      const currentWeek = this.getWeekNumber(currentDate);
      const currentYear = currentDate.getFullYear().toString();

      // Get all active facilitators with allocations
      const facilitators = await User.findAll({
        where: { userRole: "facilitator", isActive: true },
        include: [
          {
            model: CourseAllocation,
            as: "facilitatorAllocations",
            where: { isActive: true },
            required: false,
          },
        ],
      });

      for (const facilitator of facilitators) {
        if (
          facilitator.facilitatorAllocations &&
          facilitator.facilitatorAllocations.length > 0
        ) {
          for (const allocation of facilitator.facilitatorAllocations) {
            // Check if log exists for current week
            const existingLog = await ActivityTracker.findOne({
              where: {
                allocationId: allocation.id,
                facilitatorId: facilitator.id,
                weekNumber: currentWeek,
                academicYear: currentYear,
              },
            });

            if (!existingLog) {
              const reminder = {
                facilitatorId: facilitator.id,
                allocationId: allocation.id,
                weekNumber: currentWeek,
                academicYear: currentYear,
                timestamp: new Date().toISOString(),
              };

              await redisClient.lpush(
                this.reminderQueue,
                JSON.stringify(reminder)
              );
              console.log(
                `📅 Queued reminder for ${facilitator.emailAddress} - Week ${currentWeek}`
              );
            }
          }
        }
      }
    } catch (error) {
      console.error("Error checking missing submissions:", error);
    }
  }

  // Get week number of the year
  getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  // Log notification for audit purposes
  async logNotification(type, message) {
    try {
      console.log(
        `📝 Notification logged - Type: ${type}, Recipients: ${
          message.recipients ? message.recipients.length : 1
        }`
      );
    } catch (error) {
      console.error("Error logging notification:", error);
    }
  }

  // Utility function for sleeping
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

module.exports = NotificationWorker;
