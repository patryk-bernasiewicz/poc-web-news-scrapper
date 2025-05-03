"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var playwright = require("playwright");
var pages = [
    {
        url: 'https://podatki.gazetaprawna.pl/',
        containerSelector: 'article',
        linkSelector: 'a.default-teaser__link',
    },
];
var keywords = ['podatki', 'podatkowe', 'zmiany', 'vat', 'pit', 'ustawa'];
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var browser, context, page, foundArticles, _i, pages_1, entry, articles, _loop_1, _a, articles_1, article;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, playwright.chromium.launch({ headless: true })];
            case 1:
                browser = _c.sent();
                return [4 /*yield*/, browser.newContext()];
            case 2:
                context = _c.sent();
                return [4 /*yield*/, context.newPage()];
            case 3:
                page = _c.sent();
                foundArticles = [];
                _i = 0, pages_1 = pages;
                _c.label = 4;
            case 4:
                if (!(_i < pages_1.length)) return [3 /*break*/, 12];
                entry = pages_1[_i];
                return [4 /*yield*/, page.goto(entry.url)];
            case 5:
                _c.sent();
                console.log("Visiting ".concat(entry.url));
                return [4 /*yield*/, page.waitForSelector(entry.containerSelector, {
                        timeout: 10000,
                    })];
            case 6:
                _c.sent();
                return [4 /*yield*/, page.$$(entry.containerSelector)];
            case 7:
                articles = (_b = (_c.sent())) === null || _b === void 0 ? void 0 : _b.slice(0, 5);
                _loop_1 = function (article) {
                    var containerText, isKeywordPresent, linkElement, link;
                    return __generator(this, function (_d) {
                        switch (_d.label) {
                            case 0: return [4 /*yield*/, article.innerText()];
                            case 1:
                                containerText = _d.sent();
                                console.log('Container text:', containerText);
                                isKeywordPresent = keywords.some(function (keyword) {
                                    return containerText.toLowerCase().includes(keyword);
                                });
                                if (!isKeywordPresent) return [3 /*break*/, 5];
                                return [4 /*yield*/, article.$(entry.linkSelector)];
                            case 2:
                                linkElement = _d.sent();
                                if (!linkElement) return [3 /*break*/, 4];
                                return [4 /*yield*/, linkElement.getAttribute('href')];
                            case 3:
                                link = (_d.sent());
                                foundArticles.push({ text: containerText, link: link, confidence: 1 });
                                return [3 /*break*/, 5];
                            case 4:
                                foundArticles.push({ text: containerText, confidence: 0 });
                                _d.label = 5;
                            case 5: return [2 /*return*/];
                        }
                    });
                };
                _a = 0, articles_1 = articles;
                _c.label = 8;
            case 8:
                if (!(_a < articles_1.length)) return [3 /*break*/, 11];
                article = articles_1[_a];
                return [5 /*yield**/, _loop_1(article)];
            case 9:
                _c.sent();
                _c.label = 10;
            case 10:
                _a++;
                return [3 /*break*/, 8];
            case 11:
                _i++;
                return [3 /*break*/, 4];
            case 12: return [4 /*yield*/, browser.close()];
            case 13:
                _c.sent();
                console.log(JSON.stringify(foundArticles));
                return [2 /*return*/];
        }
    });
}); })();
