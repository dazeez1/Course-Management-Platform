"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex(
      "course_allocations",
      ["course_id", "cohort_id", "trimester", "intake_period", "class_section"],
      {
        unique: true,
        name: "unique_course_allocation",
      }
    );

    await queryInterface.addIndex(
      "activity_trackers",
      ["allocation_id", "week_number", "academic_year"],
      {
        unique: true,
        name: "unique_activity_tracker",
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex(
      "course_allocations",
      "unique_course_allocation"
    );
    await queryInterface.removeIndex(
      "activity_trackers",
      "unique_activity_tracker"
    );
  },
};
