<?php
/**
 * Typed `Commentable` interface as shipped by php-css-parser 9.x.
 *
 * Lives in a subdirectory so WordPress does not auto-load it as an mu-plugin;
 * otter-e2e-bootstrap.php requires it only while the foreign-Sabberworm
 * scenario (issue #2942) is armed. Once defined, loading Otter's bundled
 * untyped CSSList fatals at class-link time — exactly like a second plugin
 * shipping a newer parser release.
 *
 * @package otter-blocks
 */

// phpcs:ignoreFile -- deliberately mirrors the upstream 9.x signatures.

namespace Sabberworm\CSS\Comment;

interface Commentable {
	public function addComments( array $comments ): void;
	public function getComments(): array;
	public function setComments( array $comments ): void;
}
