/**
 * TinyMCE (open source, MIT) – edytor HTML w panelu admina.
 * Ładuje bibliotekę z CDN; przy błędzie sieci pozostaje zwykłe textarea.
 */
(function () {
  var TINY_VER = '6.8.4';
  var TINY_SRC = 'https://cdn.jsdelivr.net/npm/tinymce@' + TINY_VER + '/tinymce.min.js';
  var BASE = 'https://cdn.jsdelivr.net/npm/tinymce@' + TINY_VER;
  var PL_LANG = 'https://cdn.jsdelivr.net/npm/tinymce-i18n/langs6/pl.js';

  function dispatchReady() {
    if (window.__richEditorReadyDispatched) return;
    window.__richEditorReadyDispatched = true;
    document.dispatchEvent(new CustomEvent('rich-editor-ready'));
  }

  window.getRichHtml = function (id) {
    if (typeof tinymce !== 'undefined') {
      var ed = tinymce.get(id);
      if (ed) return ed.getContent();
    }
    var el = document.getElementById(id);
    return el ? el.value : '';
  };

  window.setRichHtml = function (id, html) {
    var v = html == null ? '' : String(html);
    if (typeof tinymce !== 'undefined') {
      var ed = tinymce.get(id);
      if (ed) {
        ed.setContent(v);
        return;
      }
    }
    var el = document.getElementById(id);
    if (el) el.value = v;
  };

  window.clearRichHtml = function (id) {
    setRichHtml(id, '');
  };

  function initTinyMce() {
    if (typeof tinymce === 'undefined') {
      dispatchReady();
      return;
    }
    var ta = document.querySelector('textarea[data-rich-editor]');
    if (!ta || !ta.id) {
      dispatchReady();
      return;
    }

    try {
      tinymce.init({
        selector: '#' + ta.id,
        height: 420,
        menubar: false,
        base_url: BASE,
        suffix: '.min',
        skin: 'oxide-dark',
        content_css: 'dark',
        language: 'pl',
        language_url: PL_LANG,
        plugins: 'lists link image code table autoresize',
        toolbar:
          'undo redo | blocks | bold italic underline strikethrough | alignleft aligncenter alignright | bullist numlist | link image | code | removeformat',
        branding: false,
        promotion: false,
        convert_urls: false,
        relative_urls: false,
        setup: function (editor) {
          editor.on('change input undo redo', function () {
            editor.save();
          });
        },
        init_instance_callback: function () {
          dispatchReady();
        }
      });
    } catch (e) {
      console.warn(e);
      dispatchReady();
    }
  }

  function loadTinyScript() {
    var ta = document.querySelector('textarea[data-rich-editor]');
    if (!ta) {
      dispatchReady();
      return;
    }
    var s = document.createElement('script');
    s.src = TINY_SRC;
    s.async = true;
    s.onload = function () {
      initTinyMce();
    };
    s.onerror = function () {
      console.warn('TinyMCE: nie udało się załadować z CDN, używane jest zwykłe pole tekstowe.');
      dispatchReady();
    };
    document.head.appendChild(s);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadTinyScript);
  } else {
    loadTinyScript();
  }

  setTimeout(function () {
    if (!window.__richEditorReadyDispatched) dispatchReady();
  }, 8000);
})();
