<?php

/**
 * Check if user has access
 *
 * @param  int $course_id
 * @param  int $user_id
 * @return bool
 */
function ld_course_check_user_access( $course_id, $user_id = null ) {}


/**
 * Get users ids that belong to a group
 * 
 * @param  int 		$group_id
 * @param  bool 	$bypass_transient to ignore transient cache
 * @return array 	array of user ids that belong to group
 */
function learndash_get_groups_user_ids( $group_id = 0, $bypass_transient = false ) {}

/**
 * Utility function to get a user's progress for a single course.
 *
 * @param integer $user_id       User ID.
 * @param integer $course_id     Course ID.
 * @param string  $progress_type Progress Type. Default 'legacy'.
 * possible values 'legacy', 'co', 'summary'
 *
 * @return array  Array of single course user progress. Format of
 *                array should match 'legacy' structure.
 */
function learndash_user_get_course_progress( $user_id = 0, $course_id = 0, $type = 'legacy' ) {}
