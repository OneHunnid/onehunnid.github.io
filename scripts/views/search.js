var Search = (function() {


	var myFirebaseRef = new Firebase("https://radiant-torch-2861.firebaseio.com/");
	var searchData = {
		title: 'Search'
	},
	template = $('#homepageTemplate').html(),
	compiled = _.template( template ),
	hash, isPlaying = 1, current = 0;

	// Partials
	var hashPartial = $('#partial-hash-search').html(),
		hashPartialCompiled = _.template( hashPartial ),
		notFoundPartial = $('#partial-no-notes-found').html(),
		notFoundCompiled = _.template( notFoundPartial ),
		hashPartialHeader = $('#partial-hash-search-header').html(),
		hashPartialHeaderCompiled = _.template( hashPartialHeader );

	// Kickstart view
	function initsearch( the_hash ) {

		hash = the_hash;

		// Load main content
		$('#main-content').html(compiled( searchData ));

		$('#searchBar').html(hashPartialHeaderCompiled({
			hash: hash
		}));

		onVal( myFirebaseRef, hash, 30 );

		// Bind events
		initFormSubmission();
		initSearchSubmission();
		initPlayPauseFeed();
		initDisplayQueue();
	}

	function onVal( myFirebaseRef, searchVal, limVal ) {
		console.log( limVal )
		myFirebaseRef.off();
		myFirebaseRef.child('hashtags/'+searchVal).once('value', function(snapshot) {
			var vals = snapshot.val();

			if ( vals === null ) {

				$('.js-home-left-col').html( notFoundCompiled({
					hash: searchVal
				}) );

				return;
			}
		});
		myFirebaseRef.child('hashtags/'+searchVal).limitToLast(limVal).on('child_added', function( snapshot ) {
			var vals = snapshot.val();

			if( isPlaying === 1 ){
				$('.js-messages').prepend( hashPartialCompiled({
					hash: searchVal,
					val: [vals],
					detectMedia: MediaDetector.detectMedia
				}) );
			}

			else {
				$('.js-current').text('Display ' + current + ' new notes');
			}
	
		});
	}

	function initDisplayQueue() {
		$('.js-current').on('click', function(e) {
			e.preventDefault();
			
			isPlaying = 1;
			onVal( myFirebaseRef, hash, current);
			current = 0;
		});
	}

	function initPlayPauseFeed() {
		$('body').off('click', '.js-pause').on('click', '.js-pause', function( e ) {
			e.preventDefault();

			isPlaying = parseInt( $( this ).attr('data-isplaying'), 10 );

			if ( isPlaying  === 1 ) {
				myFirebaseRef.child('hashtags/'+hash).off();
				$( this )
					.text('Play Feed')
					.attr('data-isplaying', 0);
				alert('feed is off')
				isPlaying = 0;
			}
			else {
				onVal( myFirebaseRef, hash, 100 );
				$( this )
					.text('Pause Feed')
					.attr('data-isplaying', 1);
				alert('feed is on');
				isPlaying = 1;
			}
			
		});
	}

	function initFormSubmission() {
		
		var form = $('#write-note');
		form.parsley();

		// Submit Note Form
		form.on('submit', function(e) {
			e.preventDefault();
			
			form.parsley().validate();

			var formObj = {
				message: $('#formTextareaMessage').val(),
				hashtag: $('#formInputHashtag').val(),
				timestamp: Firebase.ServerValue.TIMESTAMP
			};

			if ( form.parsley().isValid() ) {

				// Submit notes to database
	            myFirebaseRef.child('allNotes').push({"message": formObj.message , "hashtag": formObj.hashtag, "timestamp": formObj.timestamp});
	            myFirebaseRef.child('hashtags/' + formObj.hashtag).push({"message": formObj.message , "hashtag": formObj.hashtag, "timestamp": formObj.timestamp});

				// Reset form fields after	
				$("#formTextareaMessage").val("");
				$("#formInputHashtag").val("");
				++current;
				onVal( myFirebaseRef, formObj.hashtag, 1 );

	        }
	        // If invalid...
	        else {
	        	
	        }

		});

	}


	function initSearchSubmission() {

		var search = $('#search-notes');
		search.parsley();

		search.on('submit', function(e) {
			e.preventDefault();

			var searchVal = search.find('.search__input').val();

			search.parsley().validate();

			if ( search.parsley().isValid() ) {
				// onVal( myFirebaseRef, searchVal, 100 );
				Routes.setRoute('search/'+searchVal);

				// Reset form field after	
				$("#searchSubmit").val("");
			}
			
			// If invalid...
			else {
				
			}

		});

	}

	return {
		init: initsearch
	};

})();